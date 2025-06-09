// services/notificationService.ts
export type NotificationPermission = 'default' | 'granted' | 'denied';

let currentPermission: NotificationPermission = 'default';

// Initialize permission status
if (typeof window !== 'undefined' && 'Notification' in window) {
    currentPermission = Notification.permission as NotificationPermission;
}

export const getNotificationPermission = (): NotificationPermission => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
        // Re-check, as user might change it in browser settings
        currentPermission = Notification.permission as NotificationPermission;
    }
    return currentPermission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        console.warn('Notifications not supported by this browser.');
        currentPermission = 'denied'; // Treat as denied if not supported
        return 'denied';
    }

    // Re-check current permission before requesting
    currentPermission = Notification.permission as NotificationPermission;
    if (currentPermission === 'granted' || currentPermission === 'denied') {
        return currentPermission;
    }

    const permission = await Notification.requestPermission();
    currentPermission = permission;
    return permission;
};

export const showNotification = (title: string, options?: NotificationOptions): Notification | null => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        console.warn('Notifications not supported, cannot show notification.');
        return null;
    }
    // Always get the latest permission status before showing
    if (getNotificationPermission() !== 'granted') {
        console.warn(`Notification permission is ${getNotificationPermission()}. Cannot show notification.`);
        return null;
    }

    const notification = new Notification(title, {
        lang: 'en-US',
        // renotify: options?.tag ? true : false, // 'renotify' is not a standard property
        ...options, // Spread the provided options. 'tag' itself handles re-notification behavior.
    });
    
    notification.onclick = () => {
        if (window.parent && typeof window.parent.focus === 'function') {
          window.parent.focus();
        }
        if (typeof window.focus === 'function') {
          window.focus();
        }
        notification.close();
    };
    
    return notification;
};