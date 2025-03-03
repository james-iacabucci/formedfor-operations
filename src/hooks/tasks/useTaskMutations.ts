
import { 
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useReorderTasks
} from './mutations';

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
