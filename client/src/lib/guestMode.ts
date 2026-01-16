/**
 * Guest Mode - localStorage based nickname system
 * Allows users to play without authentication
 */

const GUEST_NICKNAME_KEY = 'blockblast_guest_nickname';

export interface GuestUser {
  nickname: string;
  isGuest: true;
}

/**
 * Get guest nickname from localStorage
 */
export function getGuestNickname(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_NICKNAME_KEY);
}

/**
 * Set guest nickname in localStorage
 */
export function setGuestNickname(nickname: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_NICKNAME_KEY, nickname);
}

/**
 * Clear guest nickname from localStorage
 */
export function clearGuestNickname(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_NICKNAME_KEY);
}

/**
 * Check if user is in guest mode
 */
export function isGuestMode(): boolean {
  return getGuestNickname() !== null;
}

/**
 * Get guest user object
 */
export function getGuestUser(): GuestUser | null {
  const nickname = getGuestNickname();
  if (!nickname) return null;
  
  return {
    nickname,
    isGuest: true,
  };
}
