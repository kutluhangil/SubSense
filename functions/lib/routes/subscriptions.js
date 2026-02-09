"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const router = express_1.default.Router();
const db = admin.firestore();
// Validation Schemas
const subscriptionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    price: zod_1.z.number().min(0, "Price must be positive"),
    originalPrice: zod_1.z.number().min(0).optional(),
    currency: zod_1.z.string().min(1, "Currency is required"),
    // Accept both frontend naming ("cycle") and REST naming ("billingCycle")
    cycle: zod_1.z.enum(["Monthly", "Yearly"]).optional(),
    billingCycle: zod_1.z.enum(["monthly", "yearly", "Monthly", "Yearly"]).optional(),
    provider: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    nextDate: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    active: zod_1.z.boolean().optional(),
    logo: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    billingDay: zod_1.z.number().optional(),
    notes: zod_1.z.string().optional(),
    history: zod_1.z.array(zod_1.z.number()).optional(),
    plan: zod_1.z.string().optional(),
});
const updateSubscriptionSchema = subscriptionSchema.partial();
// GET all subscriptions for user
router.get("/", async (req, res) => {
    const userId = req.user.uid;
    try {
        const snapshot = await db.collection("users").doc(userId).collection("subscriptions").get();
        const subscriptions = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: subscriptions,
        });
    }
    catch (error) {
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
    const userId = req.user.uid;
    // Validate Input
    const result = subscriptionSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid input data",
                details: result.error.errors,
            },
        });
        return;
    }
    const data = result.data;
    try {
        // Check for duplicates (User + Name + Provider)
        // Note: This is simplified. In a real app, might want composite index or stricter check.
        const snapshot = await db.collection("users").doc(userId).collection("subscriptions")
            .where("name", "==", data.name)
            .limit(1)
            .get();
        if (!snapshot.empty) {
            res.status(409).json({
                success: false,
                error: {
                    code: "DUPLICATE_SUBSCRIPTION",
                    message: "A subscription with the same name already exists.",
                },
            });
            return;
        }
        // Create Subscription
        const docRef = await db.collection("users").doc(userId).collection("subscriptions").add(Object.assign(Object.assign({}, data), { userId, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        res.status(201).json({
            success: true,
            data: Object.assign({ id: docRef.id }, data),
            message: "Subscription created successfully",
        });
    }
    catch (error) {
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
    const userId = req.user.uid;
    const subscriptionId = req.params.id;
    // Validate Input
    const result = updateSubscriptionSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid input data",
                details: result.error.errors,
            },
        });
        return;
    }
    const data = result.data;
    try {
        const docRef = db.collection("users").doc(userId).collection("subscriptions").doc(subscriptionId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            res.status(404).json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Subscription not found",
                },
            });
            return;
        }
        // Update Subscription
        await docRef.update(Object.assign(Object.assign({}, data), { updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        res.status(200).json({
            success: true,
            data: Object.assign({ id: subscriptionId }, data),
            message: "Subscription updated successfully",
        });
    }
    catch (error) {
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
    const userId = req.user.uid;
    const subscriptionId = req.params.id;
    try {
        const docRef = db.collection("users").doc(userId).collection("subscriptions").doc(subscriptionId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            res.status(404).json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Subscription not found",
                },
            });
            return;
        }
        await docRef.delete();
        res.status(200).json({
            success: true,
            message: "Subscription deleted successfully",
        });
    }
    catch (error) {
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
exports.default = router;
//# sourceMappingURL=subscriptions.js.map