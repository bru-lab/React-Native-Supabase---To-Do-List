import { supabase } from "./supabase";

export interface Task {
    id: string;
    title: string;
    is_completed: boolean;
    created_at: string;
}

export async function getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function createTask(title: string): Promise<Task> {
    const { data, error } = await supabase
        .from("tasks")
        .insert({
            title: title.trim(),
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function toggleTask(
    id: string,
    isCompleted: boolean
): Promise<Task> {
    const { data, error } = await supabase
        .from("tasks")
        .update({
            is_completed: isCompleted,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function deleteTask(id: string): Promise<void> {
    const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }
}