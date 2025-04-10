import {create} from "zustand/react";

export const useChatStore = create((set) => ({
    chatRooms: [],
    messages: {},
    selectedChat: null,
    unreadCounts: {},
    client: null,

    setChatRooms: (rooms) => set({chatRooms: rooms}),
    setSelectedChat: (chatData) => set({selectedChat: chatData}),
    addMessages: (roomId, message) => set((state) => ({
        ...state,
        [roomId]: [...(state.messages[roomId] || []), message],
    })),
    setUnreadCounts: (counts) => set({unreadCounts: counts}),
    setClient: (client) => set({client}),
}));