export interface Task {
    id: number;
    title: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskInput {
    title: string;
}

export interface UpdateTaskCompletedInput {
    completed: boolean;
}
