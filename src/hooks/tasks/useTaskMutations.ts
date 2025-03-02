
import { useCreateTask } from './mutations/useCreateTask';
import { useUpdateTask } from './mutations/useUpdateTask';
import { useDeleteTask } from './mutations/useDeleteTask';
import { useReorderTasks } from './mutations/useReorderTasks';

/**
 * Hook that provides all task mutation operations
 */
export function useTaskMutations() {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const reorderTasks = useReorderTasks();

  return {
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  };
}
