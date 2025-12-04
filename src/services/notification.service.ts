import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';

export interface BookingNotification {
    name: string;
    phone: string;
    prefered_date: string;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private http = inject(HttpClient);
    private ntfyUrl = environment.ntfy.url;
    private ntfyTopic = environment.ntfy.topic;

    /**
     * Send booking notification to ntfy server
     */
    async sendBookingNotification(booking: BookingNotification): Promise<void> {
        try {
            const notificationMessage = this.formatBookingMessage(booking);
            const url = `${this.ntfyUrl}/${this.ntfyTopic}`;

            await this.http.post(url, notificationMessage, {
                headers: {
                    'Content-Type': 'text/plain',
                    'Title': 'New Booking Request',
                    'Priority': 'high',
                    'Tags': 'calendar,medical'
                },
                responseType: 'text'
            }).toPromise();

            console.log('Booking notification sent successfully');
        } catch (error) {
            // Log error but don't throw - notification failure shouldn't block booking
            console.error('Failed to send ntfy notification:', error);
        }
    }

    /**
     * Format booking data into a readable notification message
     */
    private formatBookingMessage(booking: BookingNotification): string {
        let message = `New booking request received!\n\n`;
        message += `Name: ${booking.name}\n`;
        message += `Phone: ${booking.phone}\n`;
        message += `Preferred Date: ${booking.prefered_date}`;

        if (booking.message) {
            message += `\n\nMessage:\n${booking.message}`;
        }

        return message;
    }
}
