import { useId } from "react"
import { json } from "@remix-run/node"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import { useForm } from "@conform-to/react"
import { getFieldsetConstraint, parse } from "@conform-to/zod"
import { userSigninSchema } from "~/schemas"
import { authenticator } from "~/services/auth.server"
import { commitSession, getSession } from "~/services/session.server"

import { Button, Layout } from "~/components"
import { TextInput } from "~/components/shared"
import { FormFieldSet } from "~/components/ui/form"

export async function action({ request }: ActionArgs) {
  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()
  const submission = parse(formData, { schema: userSigninSchema })

  if (!submission.value || submission.intent !== "submit") {
    return submission
  }

  await authenticator.authenticate("user-pass", request, {
    successRedirect: "/",
    failureRedirect: "/login",
    throwOnError: true,
  })

  return submission
}

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("cookie"))
  const error = session.get(authenticator.sessionErrorKey)
  return json(
    { error },
    { headers: { "set-cookie": await commitSession(session) } },
  )
}

export default function Route() {
  const id = useId()
  const lastSubmission = useActionData<typeof action>()
  const { error } = useLoaderData<typeof loader>()
  const navigation = useNavigation()

  const isSubmitting = navigation.state === "submitting"

  const [form, { email, password }] = useForm({
    id,
    lastSubmission,
    shouldValidate: "onInput",
    constraint: getFieldsetConstraint(userSigninSchema),
    onValidate({ formData }) {
      return parse(formData, { schema: userSigninSchema })
    },
  })

  return (
    <Layout>
      <div className="mx-auto mb-20 mt-16 w-full max-w-7xl px-6">
        <div className="flex items-center justify-between gap-12">
          <div className="w-full">
            <h1 className="font-brand text-6xl font-bold text-primary">
              Login to your account
            </h1>
            <Form method="POST" {...form.props}>
              <FormFieldSet borderPosition="bottom">
                <div className="flex flex-col gap-6">
                  <TextInput
                    classNames={{ input: "rounded-xl" }}
                    field={email}
                    type="email"
                    label="Email"
                  />
                  <TextInput
                    classNames={{ input: "rounded-xl" }}
                    field={password}
                    label="Password"
                    type="password"
                  />
                  <p className=" text-red-500">
                    {error ? error.message : null}
                  </p>
                  <Button
                    type="submit"
                    className="ml-auto w-80"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging In..." : "Login"}
                  </Button>
                </div>
              </FormFieldSet>
              <p className="mt-10 text-xl font-semibold">
                Don’t have an account?{" "}
                <Link to="/register" className="text-primary underline">
                  Register Here
                </Link>{" "}
              </p>
            </Form>
          </div>
          <img src="pycon-auth.svg" alt="Signin Illustration" />
        </div>
      </div>
    </Layout>
  )
}
