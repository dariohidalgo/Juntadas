import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    } as any),
});

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    async function registerForPushNotificationsAsync() {
        let token: string | undefined;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice || Platform.OS === 'web') {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            console.log('Permission status:', finalStatus);
            if (finalStatus !== 'granted') {
                console.log('Permission not granted for push notifications');
                return;
            }

            // Learn more about projectId:
            // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
            // For now we try to get it without specific projectId (default)
            try {
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId ?? "e2f8ec74-2f4a-45ae-98ed-6120a6d66d3c";
                console.log("Project ID being used:", projectId);

                if (!projectId && Platform.OS !== 'web') {
                    console.log("Warning: No Project ID found");
                }

                token = (await Notifications.getExpoPushTokenAsync({
                    projectId,
                })).data;

                console.log("Expo Push Token:", token);
            } catch (e: any) {
                console.log("Error getting token:", e);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            notificationListener.current && notificationListener.current.remove();
            responseListener.current && responseListener.current.remove();
        };
    }, []);

    return {
        expoPushToken,
        notification
    };
}
