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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Trình gieo mầm dữ liệu (Seeding)...');
    const password = await bcrypt.hash('demo123', 10);
    const h1 = await prisma.user.upsert({
        where: { email: 'homeowner@demo.com' },
        update: {},
        create: {
            email: 'homeowner@demo.com',
            password,
            role: 'HOMEOWNER',
            projects: {
                create: [
                    {
                        name: 'Căn hộ Studio Mini',
                        designData: {
                            walls: [
                                { id: 'w1', start: { x: 2, y: 2 }, end: { x: 8, y: 2 }, thickness: 0.2, height: 2.7 },
                                { id: 'w2', start: { x: 8, y: 2 }, end: { x: 8, y: 8 }, thickness: 0.2, height: 2.7 },
                                { id: 'w3', start: { x: 8, y: 8 }, end: { x: 2, y: 8 }, thickness: 0.2, height: 2.7 },
                                { id: 'w4', start: { x: 2, y: 8 }, end: { x: 2, y: 2 }, thickness: 0.2, height: 2.7 },
                            ],
                            furniture: [
                                { id: 'f1', type: 'sofa', label: 'Sofa Phòng Khách', position: [5, 0, 3], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#7c3aed' }
                            ],
                            sceneMaterial: { floor: 'wood', wallPaint: '#c7d2fe' }
                        }
                    }
                ]
            }
        }
    });
    await prisma.user.upsert({
        where: { email: 'contractor@demo.com' },
        update: {},
        create: {
            email: 'contractor@demo.com',
            password,
            role: 'CONTRACTOR',
        }
    });
    console.log('✅ Đã tạo tài khoản demo:');
    console.log('- Homeowner: homeowner@demo.com / demo123');
    console.log('- Contractor: contractor@demo.com / demo123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map