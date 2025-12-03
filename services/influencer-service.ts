import { db } from '../lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';

export interface Influencer {
    id?: string;
    name: string;
    channelLink: string;
    niche: string;
    followerTier: 'Micro' | 'Macro' | 'Mega' | 'Mid-Tier' | 'Nano';
    pricePerDeliverable: number;
    contactInfo: string;
    shippingAddress: string;
    createdAt?: Timestamp;
}

const COLLECTION_NAME = 'influencers';

export const InfluencerService = {
    // Add a single influencer
    async addInfluencer(influencer: Omit<Influencer, 'id' | 'createdAt'>) {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...influencer,
                createdAt: serverTimestamp()
            });
            return { id: docRef.id, ...influencer };
        } catch (error) {
            console.error("Error adding influencer: ", error);
            throw error;
        }
    },

    // Get all influencers
    async getInfluencers() {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Influencer));
        } catch (error) {
            console.error("Error getting influencers: ", error);
            throw error;
        }
    },

    // Update an influencer
    async updateInfluencer(id: string, data: Partial<Influencer>) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, data);
        } catch (error) {
            console.error("Error updating influencer: ", error);
            throw error;
        }
    },

    // Delete an influencer
    async deleteInfluencer(id: string) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting influencer: ", error);
            throw error;
        }
    },

    // Bulk add influencers (for CSV upload)
    async bulkAddInfluencers(influencers: Omit<Influencer, 'id' | 'createdAt'>[]) {
        const promises = influencers.map(inf => this.addInfluencer(inf));
        return Promise.all(promises);
    }
};
