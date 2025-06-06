"use client"

import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useProblemStore } from "../store/useProblemStore"
import { useActions } from "../store/useAction"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2, Code2, FileText, Lightbulb, BookOpen, CheckCircle2, Save } from "lucide-react"
import Editor from "@monaco-editor/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const problemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  constraints: z.string().min(1, "Constraints are required"),
  hints: z.string().optional(),
  editorial: z.string().optional(),
  testcases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
      }),
    )
    .min(1, "At least one test case is required"),
  examples: z.object({
    JAVASCRIPT: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
    PYTHON: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
    JAVA: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
  }),
  codeSnippets: z.object({
    JAVASCRIPT: z.string().min(1, "JavaScript code snippet is required"),
    PYTHON: z.string().min(1, "Python code snippet is required"),
    JAVA: z.string().min(1, "Java solution is required"),
  }),
  referenceSolutions: z.object({
    JAVASCRIPT: z.string().min(1, "JavaScript solution is required"),
    PYTHON: z.string().min(1, "Python solution is required"),
    JAVA: z.string().min(1, "Java solution is required"),
  }),
})

const EditProblem = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProblemById, problem, isProblemLoading } = useProblemStore()
  const { onEditProblem, isUpdatingProblem } = useActions()
  const [isFormReady, setIsFormReady] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "EASY",
      tags: [""],
      constraints: "",
      hints: "",
      editorial: "",
      testcases: [{ input: "", output: "" }],
      examples: {
        JAVASCRIPT: { input: "", output: "", explanation: "" },
        PYTHON: { input: "", output: "", explanation: "" },
        JAVA: { input: "", output: "", explanation: "" },
      },
      codeSnippets: {
        JAVASCRIPT: "",
        PYTHON: "",
        JAVA: "",
      },
      referenceSolutions: {
        JAVASCRIPT: "",
        PYTHON: "",
        JAVA: "",
      },
    },
  })

  const {
    fields: testCaseFields,
    append: appendTestCase,
    remove: removeTestCase,
    replace: replaceTestCase,
  } = useFieldArray({
    control,
    name: "testcases",
  })

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
    replace: replaceTag,
  } = useFieldArray({
    control,
    name: "tags",
  })

  useEffect(() => {
    const fetchProblem = async () => {
      if (id) {
        await getProblemById(id)
      }
    }
    fetchProblem()
  }, [id, getProblemById])

  useEffect(() => {
    if (problem && Object.keys(problem).length > 0 && !isFormReady) {
      try {
        // Prepare the data for the form
        const formData = {
          title: problem.title || "",
          description: problem.description || "",
          difficulty: problem.difficulty || "EASY",
          tags: problem.tags && problem.tags.length > 0 ? problem.tags : [""],
          constraints: problem.constraints || "",
          hints: problem.hints || "",
          editorial: problem.editorial || "",
          testcases:
            problem.testcases && problem.testcases.length > 0
              ? problem.testcases.map((tc) => ({
                  input: tc.input || "",
                  output: tc.output || "",
                }))
              : [{ input: "", output: "" }],
          examples: {
            JAVASCRIPT: {
              input: problem.examples?.JAVASCRIPT?.input || "",
              output: problem.examples?.JAVASCRIPT?.output || "",
              explanation: problem.examples?.JAVASCRIPT?.explanation || "",
            },
            PYTHON: {
              input: problem.examples?.PYTHON?.input || "",
              output: problem.examples?.PYTHON?.output || "",
              explanation: problem.examples?.PYTHON?.explanation || "",
            },
            JAVA: {
              input: problem.examples?.JAVA?.input || "",
              output: problem.examples?.JAVA?.output || "",
              explanation: problem.examples?.JAVA?.explanation || "",
            },
          },
          codeSnippets: {
            JAVASCRIPT: problem.codeSnippets?.JAVASCRIPT || "",
            PYTHON: problem.codeSnippets?.PYTHON || "",
            JAVA: problem.codeSnippets?.JAVA || "",
          },
          referenceSolutions: {
            JAVASCRIPT: problem.referenceSolutions?.JAVASCRIPT || "",
            PYTHON: problem.referenceSolutions?.PYTHON || "",
            JAVA: problem.referenceSolutions?.JAVA || "",
          },
        }

        // Replace field arrays
        if (formData.tags.length > 0) {
          replaceTag(formData.tags)
        }
        if (formData.testcases.length > 0) {
          replaceTestCase(formData.testcases)
        }

        // Reset the form with the data
        reset(formData)
        setIsFormReady(true)
      } catch (error) {
        console.error("Error setting form data:", error)
        toast.error("Error loading problem data")
      }
    }
  }, [id ,problem, reset, replaceTag, replaceTestCase, isFormReady ])

  const onSubmit = async (formData) => {
    try {
      await onEditProblem(
        formData.title,
        formData.description,
        formData.examples,
        formData.difficulty,
        formData.tags,
        formData.constraints,
        formData.testcases,
        formData.codeSnippets,
        formData.referenceSolutions,
        id,
      )
      toast.success("Problem updated successfully!")
      navigate(`/problem/${id}`)
    } catch (error) {
      console.error("Error updating problem:", error)
      toast.error("Error updating problem")
    }
  }

  if (isProblemLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="fixed top-16 left-0 w-1/3 h-1/3 bg-[#4FD1C5] opacity-20 blur-3xl z-[-1] rounded-md"></div>
      <div className="fixed bottom-16 right-0 w-1/3 h-1/3 bg-[#F97316] opacity-20 blur-3xl z-[-1] rounded-md"></div>

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="card shadow-xl">
          <div className="card-body p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 border-b">
              <h2 className="card-title text-2xl md:text-3xl flex items-center gap-3">
                <FileText className="w-6 h-6 md:w-8 md:h-8 text-[#4FD1C5]" />
                Edit Problem
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text text-base md:text-lg font-semibold">Title</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full text-base md:text-lg"
                    {...register("title")}
                    placeholder="Enter problem title"
                  />
                  {errors.title && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.title.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text text-base md:text-lg font-semibold">Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered min-h-32 w-full text-base md:text-lg p-4 resize-y"
                    {...register("description")}
                    placeholder="Enter problem description"
                  />
                  {errors.description && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.description.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base md:text-lg font-semibold">Difficulty</span>
                  </label>
                  <select className="select select-bordered w-full text-base md:text-lg" {...register("difficulty")}>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                  {errors.difficulty && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.difficulty.message}</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="card p-4 md:p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Tags
                  </h3>
                  <button
                    type="button"
                    className="btn btn-primary bg-[#4FD1C5] text-white btn-sm"
                    onClick={() => appendTag("")}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Tag
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tagFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="input input-bordered flex-1"
                        {...register(`tags.${index}`)}
                        placeholder="Enter tag"
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-square btn-sm"
                        onClick={() => removeTag(index)}
                        disabled={tagFields.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-error" />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.tags && (
                  <div className="mt-2">
                    <span className="text-error text-sm">{errors.tags.message}</span>
                  </div>
                )}
              </div>

              {/* Test Cases */}
              <div className="card p-4 md:p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Test Cases
                  </h3>
                  <button
                    type="button"
                    className="btn btn-primary bg-[#4FD1C5] text-white btn-sm"
                    onClick={() => appendTestCase({ input: "", output: "" })}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Test Case
                  </button>
                </div>
                <div className="space-y-6">
                  {testCaseFields.map((field, index) => (
                    <div key={field.id} className="card shadow-md">
                      <div className="card-body p-4 md:p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-base md:text-lg font-semibold">Test Case #{index + 1}</h4>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm text-error"
                            onClick={() => removeTestCase(index)}
                            disabled={testCaseFields.length === 1}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">Input</span>
                            </label>
                            <textarea
                              className="textarea textarea-bordered min-h-24 w-full p-3 resize-y"
                              {...register(`testcases.${index}.input`)}
                              placeholder="Enter test case input"
                            />
                            {errors.testcases?.[index]?.input && (
                              <label className="label">
                                <span className="label-text-alt text-error">
                                  {errors.testcases[index].input.message}
                                </span>
                              </label>
                            )}
                          </div>
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">Expected Output</span>
                            </label>
                            <textarea
                              className="textarea textarea-bordered min-h-24 w-full p-3 resize-y"
                              {...register(`testcases.${index}.output`)}
                              placeholder="Enter expected output"
                            />
                            {errors.testcases?.[index]?.output && (
                              <label className="label">
                                <span className="label-text-alt text-error">
                                  {errors.testcases[index].output.message}
                                </span>
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.testcases && !Array.isArray(errors.testcases) && (
                  <div className="mt-2">
                    <span className="text-error text-sm">{errors.testcases.message}</span>
                  </div>
                )}
              </div>

              {/* Code Editor Sections */}
              <div className="space-y-8">
                {["JAVASCRIPT", "PYTHON", "JAVA"].map((language) => (
                  <div key={language} className="card p-4 md:p-6 shadow-md">
                    <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                      <Code2 className="w-5 h-5" />
                      {language}
                    </h3>

                    <div className="space-y-6">
                      {/* Starter Code */}
                      <div className="card shadow-md">
                        <div className="card-body p-4 md:p-6">
                          <h4 className="font-semibold text-base md:text-lg mb-4">Starter Code Template</h4>
                          <div className="border rounded-md overflow-hidden">
                            <Controller
                              name={`codeSnippets.${language}`}
                              control={control}
                              render={({ field }) => (
                                <Editor
                                  height="300px"
                                  language={language.toLowerCase()}
                                  theme="vs-dark"
                                  value={field.value}
                                  onChange={field.onChange}
                                  options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    roundedSelection: false,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                  }}
                                />
                              )}
                            />
                          </div>
                          {errors.codeSnippets?.[language] && (
                            <div className="mt-2">
                              <span className="text-error text-sm">{errors.codeSnippets[language].message}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reference Solution */}
                      <div className="card shadow-md">
                        <div className="card-body p-4 md:p-6">
                          <h4 className="font-semibold text-base md:text-lg mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            Reference Solution
                          </h4>
                          <div className="border rounded-md overflow-hidden">
                            <Controller
                              name={`referenceSolutions.${language}`}
                              control={control}
                              render={({ field }) => (
                                <Editor
                                  height="300px"
                                  language={language.toLowerCase()}
                                  theme="vs-dark"
                                  value={field.value}
                                  onChange={field.onChange}
                                  options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    roundedSelection: false,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                  }}
                                />
                              )}
                            />
                          </div>
                          {errors.referenceSolutions?.[language] && (
                            <div className="mt-2">
                              <span className="text-error text-sm">{errors.referenceSolutions[language].message}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Examples */}
                      <div className="card shadow-md">
                        <div className="card-body p-4 md:p-6">
                          <h4 className="font-semibold text-base md:text-lg mb-4">Example</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-medium">Input</span>
                              </label>
                              <textarea
                                className="textarea textarea-bordered min-h-20 w-full p-3 resize-y"
                                {...register(`examples.${language}.input`)}
                                placeholder="Example input"
                              />
                              {errors.examples?.[language]?.input && (
                                <label className="label">
                                  <span className="label-text-alt text-error">
                                    {errors.examples[language].input.message}
                                  </span>
                                </label>
                              )}
                            </div>
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-medium">Output</span>
                              </label>
                              <textarea
                                className="textarea textarea-bordered min-h-20 w-full p-3 resize-y"
                                {...register(`examples.${language}.output`)}
                                placeholder="Example output"
                              />
                              {errors.examples?.[language]?.output && (
                                <label className="label">
                                  <span className="label-text-alt text-error">
                                    {errors.examples[language].output.message}
                                  </span>
                                </label>
                              )}
                            </div>
                            <div className="form-control md:col-span-2">
                              <label className="label">
                                <span className="label-text font-medium">Explanation</span>
                              </label>
                              <textarea
                                className="textarea textarea-bordered min-h-24 w-full p-3 resize-y"
                                {...register(`examples.${language}.explanation`)}
                                placeholder="Explain the example"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Information */}
              <div className="card p-4 md:p-6 shadow-md">
                <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  Additional Information
                </h3>
                <div className="space-y-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Constraints</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered min-h-24 w-full p-3 resize-y"
                      {...register("constraints")}
                      placeholder="Enter problem constraints"
                    />
                    {errors.constraints && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.constraints.message}</span>
                      </label>
                    )}
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Hints (Optional)</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered min-h-24 w-full p-3 resize-y"
                      {...register("hints")}
                      placeholder="Enter hints for solving the problem"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Editorial (Optional)</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered min-h-32 w-full p-3 resize-y"
                      {...register("editorial")}
                      placeholder="Enter problem editorial/solution explanation"
                    />
                  </div>
                </div>
              </div>

              <div className="card-actions justify-end pt-4 border-t">
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary bg-[#4FD1C5] text-white btn-lg gap-2"
                  disabled={isUpdatingProblem}
                >
                  {isUpdatingProblem ? (
                    <span className="loading loading-spinner text-white"></span>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Problem
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProblem
