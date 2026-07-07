export const getTaskFiles = (task) => {
  if (task?.files?.length) {
    return task.files
  }

  if (task?.file?.hasFile) {
    return [task.file]
  }

  return []
}
