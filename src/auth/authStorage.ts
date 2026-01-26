import type { User } from "./authTypes";

export type StoredUser = User & { password: string };

const USERS_KEY = "sb_users";
const SESSION_KEY = "sb_session_email";

export function loadUsers(): StoredUser[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as StoredUser[];
    } catch {
        return [];
    }
}

export function saveUsers(users: StoredUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSessionEmail(): string | null {
    return localStorage.getItem(SESSION_KEY);
}

export function setSessionEmail(email: string) {
    localStorage.setItem(SESSION_KEY, email);
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}
