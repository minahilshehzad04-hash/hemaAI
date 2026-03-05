'use client'

import { useState, useCallback } from 'react';

export const useSimpleNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = useCallback((notification: {
    messageId: string;
    message: string;
    patientName: string;
    patientId: string;
  }) => {
    setNotifications(prev => {
      // Check for duplicates
      const exists = prev.find(n => n.messageId === notification.messageId);
      if (exists) return prev;

      return [...prev, {
        id: `notif-${Date.now()}-${notification.messageId}`,
        ...notification,
        timestamp: Date.now()
      }];
    });
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const removeNotificationsByPatientId = useCallback((patientId: string) => {
    setNotifications(prev => prev.filter(n => n.patientId !== patientId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    removeNotificationsByPatientId,
    clearAllNotifications
  };
};