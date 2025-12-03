import { db } from '../lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';

export interface CampaignInfluencer {
    influencerId: string;
    name: string;
    channelLink: string;
    niche: string;
    price: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    clientNotes?: string;
    contract?: string;
    contractCreatedAt?: string;
}

export interface Campaign {
    id?: string;
    name: string;
    status: 'Draft' | 'Active' | 'Completed';
    influencers: CampaignInfluencer[];
    shareToken: string;
    createdAt?: Timestamp;
}

const COLLECTION_NAME = 'campaigns';

export const CampaignService = {
    // Create a new campaign
    async createCampaign(name: string) {
        try {
            const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                name,
                status: 'Draft',
                influencers: [],
                shareToken,
                createdAt: serverTimestamp()
            });
            return { id: docRef.id, shareToken };
        } catch (error) {
            console.error("Error creating campaign: ", error);
            throw error;
        }
    },

    // Get all campaigns
    async getCampaigns() {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Campaign));
        } catch (error) {
            console.error("Error getting campaigns: ", error);
            throw error;
        }
    },

    // Get campaign by ID
    async getCampaign(id: string) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Campaign;
            }
            return null;
        } catch (error) {
            console.error("Error getting campaign: ", error);
            throw error;
        }
    },

    // Get campaign by Share Token (for public access)
    async getCampaignByToken(token: string) {
        try {
            const q = query(collection(db, COLLECTION_NAME), where('shareToken', '==', token));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                return { id: docSnap.id, ...docSnap.data() } as Campaign;
            }
            return null;
        } catch (error) {
            console.error("Error getting campaign by token: ", error);
            throw error;
        }
    },

    // Add influencers to campaign
    async addInfluencersToCampaign(campaignId: string, influencers: CampaignInfluencer[]) {
        try {
            const campaignRef = doc(db, COLLECTION_NAME, campaignId);
            const campaignSnap = await getDoc(campaignRef);

            if (campaignSnap.exists()) {
                const currentInfluencers = campaignSnap.data().influencers || [];
                // Avoid duplicates
                const newInfluencers = influencers.filter(
                    inf => !currentInfluencers.some((curr: CampaignInfluencer) => curr.influencerId === inf.influencerId)
                );

                await updateDoc(campaignRef, {
                    influencers: [...currentInfluencers, ...newInfluencers]
                });
            }
        } catch (error) {
            console.error("Error adding influencers to campaign: ", error);
            throw error;
        }
    },

    // Update influencer status (Client Action)
    async updateInfluencerStatus(campaignId: string, influencerId: string, status: 'Approved' | 'Rejected', notes: string) {
        try {
            const campaignRef = doc(db, COLLECTION_NAME, campaignId);
            const campaignSnap = await getDoc(campaignRef);

            if (campaignSnap.exists()) {
                const influencers = campaignSnap.data().influencers as CampaignInfluencer[];
                const updatedInfluencers = influencers.map(inf => {
                    if (inf.influencerId === influencerId) {
                        return { ...inf, status, clientNotes: notes };
                    }
                    return inf;
                });

                await updateDoc(campaignRef, { influencers: updatedInfluencers });
            }
        } catch (error) {
            console.error("Error updating influencer status: ", error);
            throw error;
        }
    },

    // Update influencer contract
    async updateInfluencerContract(campaignId: string, influencerId: string, contract: string) {
        try {
            const campaignRef = doc(db, COLLECTION_NAME, campaignId);
            const campaignSnap = await getDoc(campaignRef);

            if (campaignSnap.exists()) {
                const influencers = campaignSnap.data().influencers as CampaignInfluencer[];
                const updatedInfluencers = influencers.map(inf => {
                    if (inf.influencerId === influencerId) {
                        return {
                            ...inf,
                            contract,
                            contractCreatedAt: new Date().toISOString()
                        };
                    }
                    return inf;
                });

                await updateDoc(campaignRef, { influencers: updatedInfluencers });
            }
        } catch (error) {
            console.error("Error updating influencer contract: ", error);
            throw error;
        }
    },

    // Delete campaign
    async deleteCampaign(id: string) {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting campaign: ", error);
            throw error;
        }
    }
};
