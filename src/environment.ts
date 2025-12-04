// Environment configuration
export const environment = {
    production: false,
    pocketbase: {
        // Default to localhost - update this with your PocketBase instance URL
        url: 'https://allevia-pb.kareemzaher.com'
    },
    ntfy: {
        url: 'https://allevia-ntfy.kareemzaher.com',
        topic: 'allevia_bookings'
    }
};
