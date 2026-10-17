import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { X, Plus, Trash2, ChevronDown, ListChecks } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OptionField {
  text: string
}

interface QuestionField {
  question: string
  options: OptionField[]
}

interface CreatePollFormValues {
  title: string
  isActive: boolean
  responseMode: 'verified' | 'anonymous'
  startsAt: string
  expiresAt: string
  isPublished: boolean
  questions: QuestionField[]
}

interface CreatePollProps {
  isOpen: boolean
  onClose: () => void
  creatorId: string
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const toLocalDatetimeValue = (date: Date) => {
  // Produces "YYYY-MM-DDTHH:MM" suitable for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// ─── Component ────────────────────────────────────────────────────────────────

const CreatePoll = ({ isOpen, onClose, creatorId }: CreatePollProps) => {
  const now = new Date()
  const defaultExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // +7 days

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePollFormValues>({
    defaultValues: {
      title: '',
      isActive: true,
      responseMode: 'verified',
      startsAt: '',
      expiresAt: toLocalDatetimeValue(defaultExpiry),
      isPublished: false,
      questions: [
        {
          question: '',
          options: [{ text: '' }, { text: '' }],
        },
      ],
    },
  })

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control, name: 'questions' })

  // Trap keyboard / close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const onSubmit = async (data: CreatePollFormValues) => {
    const payload = {
      title: data.title,
      creatorId,
      isActive: data.isActive,
      responseMode: data.responseMode,
      ...(data.startsAt ? { startsAt: new Date(data.startsAt).toISOString() } : {}),
      expiresAt: new Date(data.expiresAt).toISOString(),
      isPublished: data.isPublished,
      questions: data.questions.map((q) => ({
        question: q.question,
        options: q.options.map((o) => ({ text: o.text })),
      })),
    }
    console.log('Create poll payload:', payload)
    // TODO: wire to your API call here
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Blurred semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      {/* Modal panel */}
      <div
        className="
          relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto
          rounded-3xl border border-slate-200/60 dark:border-white/10
          bg-white/80 dark:bg-zinc-900/80
          backdrop-blur-xl shadow-2xl
          p-6 sm:p-8
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500">
              <ListChecks size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Poll</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Fill in the details below</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── Title ── */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Poll Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Programming Survey"
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 1, message: 'Title cannot be empty' },
                maxLength: { value: 255, message: 'Title must be at most 255 characters' },
              })}
              className="
                w-full px-4 py-2.5 text-sm rounded-xl
                border border-slate-200 dark:border-zinc-700
                bg-slate-50 dark:bg-zinc-800/80
                text-slate-900 dark:text-white
                placeholder-slate-400 dark:placeholder-zinc-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition
              "
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* ── Response Mode ── */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Response Mode
            </label>
            <div className="relative">
              <select
                {...register('responseMode')}
                className="
                  w-full appearance-none px-4 py-2.5 pr-10 text-sm rounded-xl
                  border border-slate-200 dark:border-zinc-700
                  bg-slate-50 dark:bg-zinc-800/80
                  text-slate-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer
                "
              >
                <option value="verified">Verified</option>
                <option value="anonymous">Anonymous</option>
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            </div>
          </div>

          {/* ── Dates row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Starts At (optional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Starts At <span className="text-slate-400 dark:text-zinc-500 font-normal text-xs">(optional)</span>
              </label>
              <input
                type="datetime-local"
                {...register('startsAt', {
                  validate: (v) => {
                    if (!v) return true
                    if (new Date(v) < new Date()) return 'Start date cannot be in the past'
                    return true
                  },
                })}
                className="
                  w-full px-4 py-2.5 text-sm rounded-xl
                  border border-slate-200 dark:border-zinc-700
                  bg-slate-50 dark:bg-zinc-800/80
                  text-slate-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                "
              />
              {errors.startsAt && (
                <p className="mt-1 text-xs text-red-500">{errors.startsAt.message}</p>
              )}
            </div>

            {/* Expires At */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Expires At <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register('expiresAt', {
                  required: 'Expiry date is required',
                  validate: (v, formValues) => {
                    if (new Date(v) < new Date()) return 'Expiry date cannot be in the past'
                    if (formValues.startsAt && new Date(v) <= new Date(formValues.startsAt))
                      return 'Expiry must be after start date'
                    return true
                  },
                })}
                className="
                  w-full px-4 py-2.5 text-sm rounded-xl
                  border border-slate-200 dark:border-zinc-700
                  bg-slate-50 dark:bg-zinc-800/80
                  text-slate-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                "
              />
              {errors.expiresAt && (
                <p className="mt-1 text-xs text-red-500">{errors.expiresAt.message}</p>
              )}
            </div>
          </div>

          {/* ── Toggles row ── */}
          <div className="flex flex-wrap gap-6">
            {/* isActive toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer group select-none">
              <div className="relative">
                <input type="checkbox" {...register('isActive')} className="sr-only peer" />
                <div className="w-10 h-6 rounded-full bg-slate-200 dark:bg-zinc-700 peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Active</span>
            </label>

            {/* isPublished toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer group select-none">
              <div className="relative">
                <input type="checkbox" {...register('isPublished')} className="sr-only peer" />
                <div className="w-10 h-6 rounded-full bg-slate-200 dark:bg-zinc-700 peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Published</span>
            </label>
          </div>

          {/* ── Questions ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                Questions <span className="text-red-500">*</span>
                <span className="ml-2 text-xs font-normal text-slate-400 dark:text-zinc-500">(1–10)</span>
              </label>
              {questionFields.length < 10 && (
                <button
                  type="button"
                  onClick={() => appendQuestion({ question: '', options: [{ text: '' }, { text: '' }] })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition cursor-pointer"
                >
                  <Plus size={14} />
                  Add Question
                </button>
              )}
            </div>

            <div className="space-y-4">
              {questionFields.map((qField, qIndex) => (
                <QuestionBlock
                  key={qField.id}
                  qIndex={qIndex}
                  control={control}
                  register={register}
                  errors={errors}
                  canRemove={questionFields.length > 1}
                  onRemove={() => removeQuestion(qIndex)}
                />
              ))}
            </div>
          </div>

          {/* ── Footer Actions ── */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating…' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── QuestionBlock sub-component ─────────────────────────────────────────────

interface QuestionBlockProps {
  qIndex: number
  control: ReturnType<typeof useForm<CreatePollFormValues>>['control']
  register: ReturnType<typeof useForm<CreatePollFormValues>>['register']
  errors: ReturnType<typeof useForm<CreatePollFormValues>>['formState']['errors']
  canRemove: boolean
  onRemove: () => void
}

const QuestionBlock = ({ qIndex, control, register, errors, canRemove, onRemove }: QuestionBlockProps) => {
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: `questions.${qIndex}.options` })

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 p-4">
      {/* Question header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Question {qIndex + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
          >
            <Trash2 size={13} />
            Remove
          </button>
        )}
      </div>

      {/* Question text input */}
      <input
        type="text"
        placeholder="Enter your question…"
        {...register(`questions.${qIndex}.question`, {
          required: 'Question text is required',
          minLength: { value: 1, message: 'Question cannot be empty' },
          maxLength: { value: 255, message: 'Question must be at most 255 characters' },
        })}
        className="
          w-full px-3.5 py-2.5 text-sm rounded-xl mb-3
          border border-slate-200 dark:border-zinc-700
          bg-white dark:bg-zinc-900/60
          text-slate-900 dark:text-white
          placeholder-slate-400 dark:placeholder-zinc-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition
        "
      />
      {errors.questions?.[qIndex]?.question && (
        <p className="mb-2 text-xs text-red-500">{errors.questions[qIndex]?.question?.message}</p>
      )}

      {/* Options */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
          Options <span className="font-normal">(2–10)</span>
        </p>

        {optionFields.map((oField, oIndex) => (
          <div key={oField.id} className="flex items-center gap-2">
            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-700 text-[10px] font-bold text-slate-600 dark:text-zinc-300">
              {oIndex + 1}
            </span>
            <input
              type="text"
              placeholder={`Option ${oIndex + 1}`}
              {...register(`questions.${qIndex}.options.${oIndex}.text`, {
                required: 'Option text is required',
                minLength: { value: 1, message: 'Cannot be empty' },
                maxLength: { value: 255, message: 'At most 255 characters' },
              })}
              className="
                flex-1 px-3 py-2 text-sm rounded-xl
                border border-slate-200 dark:border-zinc-700
                bg-white dark:bg-zinc-900/60
                text-slate-900 dark:text-white
                placeholder-slate-400 dark:placeholder-zinc-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition
              "
            />
            {optionFields.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(oIndex)}
                className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                aria-label="Remove option"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ))}

        {/* Option error */}
        {errors.questions?.[qIndex]?.options && (
          <p className="text-xs text-red-500">All option fields are required</p>
        )}

        {optionFields.length < 10 && (
          <button
            type="button"
            onClick={() => appendOption({ text: '' })}
            className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
          >
            <Plus size={13} />
            Add Option
          </button>
        )}
      </div>
    </div>
  )
}

export default CreatePoll
