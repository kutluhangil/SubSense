
import * as express from "express";
import * as admin from "firebase-admin";
import { z } from "zod";

const router = express.Router();
const db = admin.firestore();

// Validation Schemas
const subscriptionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.number().min(0, "Price must be positive"),
    currency: z.string().length(3, "Currency code must be 3 characters"),
    billingCycle: z.enum(["monthly", "yearly"]),
    provider: z.string().optional(),
    category: z.string().optional(),
    startDate: z.string().optional(), // ISO date string
    description: z.string().optional(),
    active: z.boolean().optional(),
});

const updateSubscriptionSchema = subscriptionSchema.partial();

// GET all subscriptions for user
router.get("/", async (req, res) => {
    const userId = (req as any).user.uid;
    try {
        const snapshot = await db.collection("users").doc(userId).collection("subscriptions").get();
        const subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({
            success: true,
            data: subscriptions,
        });
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch subscriptions",
            },
        });
    }
});

// POST create subscription
router.post("/", async (req, res) => {
    const userId = (req as any).user.uid;

    // Validate Input
    const result = subscriptionSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid input data",
                details: result.error.errors,
            },
        });
    }

    const data = result.data;

    try {
        // Check for duplicates (User + Name + Provider)
        // Note: This is simplified. In a real app, might want composite index or stricter check.
        const snapshot = await db.collection("users").doc(userId).collection("subscriptions")
            .where("name", "==", data.name)
            .where("provider", "==", data.provider || null)
            .where("billingCycle", "==", data.billingCycle)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            return res.status(409).json({
                success: false,
                error: {
                    code: "DUPLICATE_SUBSCRIPTION",
                    message: "A subscription with the same name, provider and billing cycle already exists.",
                },
            });
        }

        // Create Subscription
        const docRef = await db.collection("users").doc(userId).collection("subscriptions").add({
            ...data,
            userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({
            success: true,
            data: { id: docRef.id, ...data },
            message: "Subscription created successfully",
        });
    } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create subscription",
            },
        });
    }
});

// PUT update subscription
router.put("/:id", async (req, res) => {
    const userId = (req as any).user.uid;
    const subscriptionId = req.params.id;

    // Validate Input
    const result = updateSubscriptionSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid input data",
                details: result.error.errors,
            },
        });
    }

    const data = result.data;

    try {
        const docRef = db.collection("users").doc(userId).collection("subscriptions").doc(subscriptionId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Subscription not found",
                },
            });
        }

        // Update Subscription
        await docRef.update({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({
            success: true,
            data: { id: subscriptionId, ...data }, // Note: timestamps won't be exact here, but sufficient for response
            message: "Subscription updated successfully",
        });
    } catch (error) {
        console.error("Error updating subscription:", error);
        res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update subscription",
            },
        });
    }
});

// DELETE subscription
router.delete("/:id", async (req, res) => {
    const userId = (req as any).user.uid;
    const subscriptionId = req.params.id;

    try {
        const docRef = db.collection("users").doc(userId).collection("subscriptions").doc(subscriptionId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Subscription not found",
                },
            });
        }

        await docRef.delete();

        res.status(200).json({
            success: true,
            message: "Subscription deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting subscription:", error);
        res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to delete subscription",
            },
        });
    }
});

export default router;
