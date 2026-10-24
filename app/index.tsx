import { useCallback, useEffect, useState } from "react";

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StatusBar,
    Text,
    TextInput,
    View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
    createTask,
    deleteTask,
    getTasks,
    Task,
    toggleTask as updateTaskStatus,
} from "../lib/task.api";

export default function HomeScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [showInput, setShowInput] = useState(false);

    const completedTasks = tasks.filter(
        (task) => task.is_completed
    ).length;

    const loadTasks = useCallback(async () => {
        try {
            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            console.error("Error loading tasks:", error);

            Alert.alert(
                "Error",
                "Unable to load tasks. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    async function handleCreateTask() {
        const title = newTaskTitle.trim();

        if (!title) {
            Alert.alert("Missing title", "Please enter a task title.");
            return;
        }

        try {
            setSaving(true);

            const task = await createTask(title);

            setTasks((currentTasks) => [
                task,
                ...currentTasks,
            ]);

            setNewTaskTitle("");
            setShowInput(false);
        } catch (error) {
            console.error("Error creating task:", error);

            Alert.alert(
                "Error",
                "Unable to create the task."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleToggleTask(task: Task) {
        const previousStatus = task.is_completed;
        const nextStatus = !previousStatus;

        // Update the UI immediately.
        setTasks((currentTasks) =>
            currentTasks.map((item) =>
                item.id === task.id
                    ? { ...item, is_completed: nextStatus }
                    : item
            )
        );

        try {
            await updateTaskStatus(task.id, nextStatus);
        } catch (error) {
            console.error("Error updating task:", error);

            // Restore the original state if the request fails.
            setTasks((currentTasks) =>
                currentTasks.map((item) =>
                    item.id === task.id
                        ? {
                              ...item,
                              is_completed: previousStatus,
                          }
                        : item
                )
            );

            Alert.alert(
                "Error",
                "Unable to update the task."
            );
        }
    }

    function handleDeleteTask(task: Task) {
        Alert.alert(
            "Delete task",
            `Are you sure you want to delete "${task.title}"?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteTask(task.id);

                            setTasks((currentTasks) =>
                                currentTasks.filter(
                                    (item) => item.id !== task.id
                                )
                            );
                        } catch (error) {
                            console.error(
                                "Error deleting task:",
                                error
                            );

                            Alert.alert(
                                "Error",
                                "Unable to delete the task."
                            );
                        }
                    },
                },
            ]
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar barStyle="dark-content" />

            <View className="flex-1 px-6 pt-6">
                {/* Header */}
                <View className="mb-8">
                    <Text className="text-sm font-medium text-muted">
                        YOUR PERSONAL WORKSPACE
                    </Text>

                    <Text className="mt-2 text-3xl font-bold text-foreground">
                        TaskFlow
                    </Text>

                    <Text className="mt-2 text-base text-muted">
                        Organize your day, one task at a time.
                    </Text>
                </View>

                {/* Progress card */}
                <View className="mb-8 rounded-3xl bg-primary p-6">
                    <Text className="text-sm font-medium text-white">
                        YOUR PROGRESS
                    </Text>

                    <Text className="mt-3 text-4xl font-bold text-white">
                        {completedTasks}/{tasks.length}
                    </Text>

                    <Text className="mt-2 text-sm text-white">
                        Tasks completed
                    </Text>

                    <View className="mt-5 h-2 overflow-hidden rounded-full bg-white/30">
                        <View
                            className="h-full rounded-full bg-white"
                            style={{
                                width:
                                    tasks.length > 0
                                        ? `${
                                              (completedTasks /
                                                  tasks.length) *
                                              100
                                          }%`
                                        : "0%",
                            }}
                        />
                    </View>
                </View>

                {/* Task list heading */}
                <View className="mb-4 flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-foreground">
                        My tasks
                    </Text>

                    <Text className="text-sm font-medium text-muted">
                        {tasks.length} total
                    </Text>
                </View>

                {/* Create task form */}
                {showInput && (
                    <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <TextInput
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            placeholder="What do you need to do?"
                            placeholderTextColor="#94A3B8"
                            autoFocus
                            editable={!saving}
                            returnKeyType="done"
                            onSubmitEditing={handleCreateTask}
                            className="mb-3 rounded-xl bg-slate-50 px-4 py-3 text-base text-foreground"
                        />

                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => {
                                    setShowInput(false);
                                    setNewTaskTitle("");
                                }}
                                disabled={saving}
                                className="flex-1 items-center rounded-xl bg-slate-100 py-3"
                            >
                                <Text className="font-semibold text-foreground">
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={handleCreateTask}
                                disabled={saving}
                                className="flex-1 items-center rounded-xl bg-primary py-3"
                            >
                                <Text className="font-semibold text-white">
                                    {saving ? "Saving..." : "Save task"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Task list */}
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator
                            size="large"
                            color="#0D9488"
                        />

                        <Text className="mt-3 text-muted">
                            Loading tasks...
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 110,
                            flexGrow: 1,
                        }}
                        ListEmptyComponent={
                            <View className="items-center py-12">
                                <Text className="text-base text-muted">
                                    No tasks yet.
                                </Text>

                                <Text className="mt-2 text-sm text-muted">
                                    Add your first task to get started!
                                </Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <View className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4">
                                <Pressable
                                    onPress={() =>
                                        handleToggleTask(item)
                                    }
                                    accessibilityRole="checkbox"
                                    accessibilityState={{
                                        checked: item.is_completed,
                                    }}
                                    className={`mr-4 h-6 w-6 items-center justify-center rounded-full border-2 ${
                                        item.is_completed
                                            ? "border-primary bg-primary"
                                            : "border-slate-300 bg-white"
                                    }`}
                                >
                                    {item.is_completed && (
                                        <Text className="text-xs font-bold text-white">
                                            ✓
                                        </Text>
                                    )}
                                </Pressable>

                                <Pressable
                                    onPress={() =>
                                        handleToggleTask(item)
                                    }
                                    className="flex-1"
                                >
                                    <Text
                                        className={`text-base ${
                                            item.is_completed
                                                ? "text-slate-400 line-through"
                                                : "text-foreground"
                                        }`}
                                    >
                                        {item.title}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() =>
                                        handleDeleteTask(item)
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel={`Delete ${item.title}`}
                                    className="ml-3 rounded-lg bg-red-50 px-3 py-2"
                                >
                                    <Text className="text-sm font-medium text-red-500">
                                        Delete
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    />
                )}

                {/* Add task button */}
                {!showInput && (
                    <Pressable
                        onPress={() => setShowInput(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Add a task"
                        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary"
                        style={{
                            elevation: 5,
                        }}
                    >
                        <Text className="text-3xl font-light text-white">
                            +
                        </Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}