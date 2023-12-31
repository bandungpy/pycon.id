import { useEffect, useId, useRef, useState } from "react"
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import { conform, useFieldset, useForm } from "@conform-to/react"
import { getFieldsetConstraint, parse } from "@conform-to/zod"
import type { loader } from "~/routes/_user.account._index"
import { userUpdateSchema } from "~/schemas"

import { transformCheckboxFields } from "~/libs/transform-checkbox"
import { useCountryStateCity } from "~/hooks/useCountryStateCity"
import { useUpdateEffect } from "~/hooks/useUpdateEffect"
import { CheckboxInput, SelectInput, TextInput } from "~/components/shared"
import { Button, DatePicker, Textarea } from "~/components/ui"
import { FormField, FormFieldSet, FormLabel } from "~/components/ui/form"
import { genderData } from "~/data/gender"
import { lookingForData } from "~/data/looking-for"
import { tshirtSizeData } from "~/data/tshirt-size"

import { AvatarUpload } from "../shared/avatar-upload"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { useToast } from "../ui/use-toast"

export const AccountForm = () => {
  const { toast } = useToast()
  const formId = useId()
  const { industryCategories, jobCategories, participantTypes, userProfile } =
    useLoaderData<typeof loader>()
  const lastSubmission = useActionData()
  const navigation = useNavigation()

  const [isUploading, setIsUploading] = useState<boolean>(false)
  const isSubmitting = navigation.state === "submitting"

  const complianceErrorRef = useRef<HTMLParagraphElement>(null)

  const [
    form,
    {
      id,
      avatar,
      firstName,
      lastName,
      displayName,
      email,
      organisation,
      industryCategoryId,
      jobCategoryId,
      jobTitle,
      tShirtSize,
      gender,
      dateOfBirth,
      phone,
      bio,
      interest,
      lookingFor,
      offeringSearching,
      country,
      state,
      city,
      address,
      website,
      github,
      facebook,
      linkedin,
      twitter,
      instagram,
      participantTypeId,
      compliance,
      publicFields,
    },
  ] = useForm({
    id: formId,
    lastSubmission,
    constraint: getFieldsetConstraint(userUpdateSchema),
    onValidate({ formData }) {
      const submission = parse(formData, { schema: userUpdateSchema })
      return submission
    },
    defaultValue: {
      ...userProfile,
      compliance: transformCheckboxFields(userProfile.compliance),
      publicFields: transformCheckboxFields(userProfile.PublicFields),
    },
  })

  const {
    email: isEmailPublic,
    company: isCompanyPublic,
    gender: isGenderPublic,
    phone: isPhonePublic,
    address: isAddressPublic,
    lookingFor: isLookingForPublic,
    socials: isSocialsPublic,
    jobCategories: isJobCategoriesPublic,
  } = useFieldset(form.ref, publicFields)

  const { codeOfConduct } = useFieldset(form.ref, compliance)

  const { countries, states, cities, setCiso, setSiso } = useCountryStateCity(
    country.defaultValue,
    state.defaultValue,
  )

  useUpdateEffect(() => {
    if (navigation.state === "idle" && lastSubmission?.success) {
      toast({ title: "Profile updated successfully!", duration: 2000 })
    }
  }, [navigation.state])

  useEffect(() => {
    if (compliance.error) {
      complianceErrorRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [compliance.error])

  return (
    <Form encType="multipart/form-data" method="POST" {...form.props}>
      <input type="hidden" {...conform.input(id)} />
      <div className="mx-auto mb-8 mt-16 w-full max-w-4xl px-6">
        <AvatarUpload
          setUploading={setIsUploading}
          userId={id.defaultValue as string}
          firstName={firstName.defaultValue}
          lastName={lastName.defaultValue}
          field={avatar}
        />
        <FormFieldSet title="Profile" disabled={isSubmitting}>
          <div className="flex gap-6">
            <TextInput
              field={firstName}
              label="First Name"
              placeholder="First Name"
            />
            <TextInput
              field={lastName}
              label="Last Name"
              placeholder="Last Name"
            />
          </div>
          <TextInput
            field={displayName}
            label="Display Name"
            placeholder="Display Name"
          />
          <div className="space-y-5 rounded-lg bg-primary/5 px-5 py-4">
            <TextInput
              field={email}
              label="Email *"
              placeholder="Email"
              type="email"
              disabled
            />
            <CheckboxInput field={isEmailPublic}>
              Share my email to public
            </CheckboxInput>
          </div>
          <div className="space-y-5 rounded-lg bg-primary/5 px-5 py-4">
            <TextInput
              field={organisation}
              label="Company"
              placeholder="Company"
            />
            <SelectInput
              field={industryCategoryId}
              label="Industry Categories"
              placeholder="Select Industry Categories"
            >
              {industryCategories.map(({ name, id }) => (
                <SelectInput.Option key={id} value={id}>
                  {name}
                </SelectInput.Option>
              ))}
            </SelectInput>

            <CheckboxInput field={isCompanyPublic}>
              Share my company to public
            </CheckboxInput>
          </div>
          <div className="space-y-5 rounded-lg bg-primary/5 px-5 py-4">
            <TextInput
              field={jobTitle}
              label="Job Title"
              placeholder="e.g. Web Developer"
            />
            <SelectInput
              field={jobCategoryId}
              label="Job Categories"
              placeholder="Choose Job Categoires"
            >
              {jobCategories.map(({ name, id }) => (
                <SelectInput.Option key={id} value={id}>
                  {name}
                </SelectInput.Option>
              ))}
            </SelectInput>
            <CheckboxInput field={isJobCategoriesPublic}>
              Share my Job Title & Categories to public
            </CheckboxInput>
          </div>
          <SelectInput
            field={tShirtSize}
            label="T-Shirt Size"
            placeholder="Choose T-Shirt Size"
            extra={
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="underline">
                    Size chart
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>PyCon ID T-Shirt Size Chart</DialogTitle>
                  </DialogHeader>
                  <img src="/size-chart.jpg" alt="Chart Size" />
                </DialogContent>
              </Dialog>
            }
          >
            {tshirtSizeData.map(({ name, symbol }) => (
              <SelectInput.Option key={symbol} value={symbol}>
                {name}
              </SelectInput.Option>
            ))}
          </SelectInput>

          <div className="flex flex-col items-center justify-center gap-1 md:gap-6 lg:flex-row">
            <SelectInput
              field={gender}
              label="Gender"
              placeholder="Choose Gender"
            >
              {genderData.map(({ name, symbol }) => (
                <SelectInput.Option key={symbol} value={symbol}>
                  {name}
                </SelectInput.Option>
              ))}
            </SelectInput>
            <CheckboxInput
              className="mt-2 flex w-48 flex-none space-y-0 self-start md:mt-7 md:items-center md:self-center"
              field={isGenderPublic}
            >
              Share to public
            </CheckboxInput>
          </div>
          <FormField>
            <FormLabel htmlFor={dateOfBirth.id}>Date of Birth *</FormLabel>
            <DatePicker field={dateOfBirth} />
            {dateOfBirth.error ? (
              <p
                className="text-sm text-red-500 md:h-4 md:text-base"
                id={dateOfBirth.errorId}
              >
                {dateOfBirth.error}
              </p>
            ) : null}
          </FormField>
          <div className="space-y-5 rounded-lg bg-primary/5 px-5 py-4">
            <TextInput
              field={phone}
              label="Mobile Number"
              placeholder="e.g. +628222"
            />
            <CheckboxInput field={isPhonePublic}>
              Share my phone number to public
            </CheckboxInput>
          </div>
          <FormField>
            <FormLabel htmlFor={bio.id}>About *</FormLabel>
            <Textarea {...conform.input(bio)} placeholder="Hi, I am ..." />
            {bio.error ? (
              <p
                className="text-sm text-red-500 md:h-4 md:text-base"
                id={bio.errorId}
              >
                {bio.error}
              </p>
            ) : null}
          </FormField>
          <TextInput
            field={interest}
            label="Interests"
            placeholder="Enter you interests"
            description="Write your interest and separate it by comma (e.g. Data, NLP)"
          />
          <div className="space-y-5 rounded-lg bg-primary/5 px-5 py-4">
            <SelectInput
              field={lookingFor}
              label="Looking for"
              placeholder="Choose what you want"
            >
              {lookingForData.map(({ name, symbol }) => (
                <SelectInput.Option key={symbol} value={symbol}>
                  {name}
                </SelectInput.Option>
              ))}
            </SelectInput>
            <TextInput
              field={offeringSearching}
              label="Offering / Searching Expertise"
              placeholder="Enter you searching expertise"
              description="Write your offering / searching expertise and separate it by comma (e.g. Data, NLP)"
            />
            <CheckboxInput field={isLookingForPublic}>
              Share your offering / searching expertise to public
            </CheckboxInput>
          </div>
        </FormFieldSet>
        <FormFieldSet title="Address" disabled={isSubmitting}>
          <div className="space-y-5 rounded-lg bg-primary/5 px-5 py-4">
            <SelectInput
              field={country}
              label="Country"
              placeholder="Choose country"
              onValueChange={(value) => setCiso(value)}
            >
              {countries?.map(({ name, iso2 }) => (
                <SelectInput.Option key={iso2} value={iso2}>
                  {name}
                </SelectInput.Option>
              ))}
            </SelectInput>
            <div className="flex flex-col items-center gap-4 space-y-2 lg:flex-row lg:space-y-0">
              <SelectInput
                field={state}
                label="State"
                placeholder="Choose state"
                onValueChange={(value) => setSiso(value)}
              >
                {states?.map(({ name, iso2 }) => (
                  <SelectInput.Option key={iso2} value={iso2}>
                    {name}
                  </SelectInput.Option>
                ))}
              </SelectInput>
              <SelectInput field={city} label="City" placeholder="Choose city">
                {cities?.map(({ id, name }) => (
                  <SelectInput.Option key={id} value={name}>
                    {name}
                  </SelectInput.Option>
                ))}
              </SelectInput>
            </div>
            <TextInput
              field={address}
              label="Street Address"
              placeholder="Enter your street number"
            />
            <CheckboxInput field={isAddressPublic}>
              Share to public my address
            </CheckboxInput>
          </div>
        </FormFieldSet>
        <FormFieldSet title="Social Media" disabled={isSubmitting}>
          <div className="space-y-5 rounded-lg bg-primary/5 px-5 py-4">
            <TextInput
              field={website}
              label="Website / Portofolio"
              placeholder="Share your website/portflio link"
            />
            <TextInput
              field={github}
              label="Github Username"
              placeholder="Share your Github username"
            />
            <TextInput
              field={facebook}
              label="Facebook Username"
              placeholder="Share your Facebook username"
            />
            <TextInput
              field={linkedin}
              label="LinkedIn Username"
              placeholder="Share your LinkedIn username"
            />
            <TextInput
              field={twitter}
              label="Twitter Username"
              placeholder="Share your Twitter username"
            />
            <TextInput
              field={instagram}
              label="Instagram Username"
              placeholder="Share your Twitter username"
            />
            <CheckboxInput field={isSocialsPublic}>
              Share my social media to the public
            </CheckboxInput>
          </div>
        </FormFieldSet>
        <FormFieldSet title="Participant">
          <SelectInput
            field={participantTypeId}
            label="Participant Type"
            placeholder="Non Participant"
            disabled
          >
            {participantTypes.map(({ name, id }) => (
              <SelectInput.Option key={id} value={id}>
                {name}
              </SelectInput.Option>
            ))}
          </SelectInput>
          <CheckboxInput
            label="Code of Conduct"
            field={codeOfConduct}
            disabled={isSubmitting}
          >
            By checking this box, I confirm that I have read and agree to the
            code of conduct.
            <span className="font-bold underline">
              <Link to="/coc">Click here to read the full version</Link>
            </span>
          </CheckboxInput>
          {/* <CheckboxInput
            label="Terms of Service Knowledge"
            field={termsOfService}
            disabled={isSubmitting}
          >
            Lorem ipsum dolor sit amet consectetur. Mi in tortor gravida tortor
            mi id ut. Egestas lobortis neque elit gravida ac nec pellentesque
            pellentesque.{" "}
            <span className="font-bold underline">
              <Link to="/coc">Click here to read the full version</Link>
            </span>
          </CheckboxInput> */}
          {compliance.error ? (
            <p
              ref={complianceErrorRef}
              className="text-sm text-red-500 md:h-4 md:text-base"
              id={compliance.errorId}
            >
              {compliance.error}
            </p>
          ) : null}
        </FormFieldSet>
      </div>
      <div className="sticky bottom-10 mx-auto mb-10 mt-8 flex w-full max-w-5xl items-center justify-between gap-4 rounded-full bg-primary-100 px-10 py-5">
        <p>* Mandatory</p>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isUploading
            ? "Uploading..."
            : isSubmitting
            ? "Saving..."
            : "Save Changes"}
        </Button>
      </div>
    </Form>
  )
}
