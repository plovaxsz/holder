export const formatIDR = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
};

// --- UAW BEA CUKAI STANDARD ---
// Simple = 1, Average = 2, Complex = 3
export const getActorComplexity = (type) => {
    if (type === 'API') return { level: 'Simple', weight: 1 };
    if (type === 'Protocol') return { level: 'Average', weight: 2 };
    if (type === 'GUI') return { level: 'Complex', weight: 3 };
    return { level: 'Complex', weight: 3 }; // Fallback for GUI/Web Page
};

// --- UUCW BEA CUKAI STANDARD ---
// Simple (<=3) = 5, Average (4-7) = 10, Complex (>7) = 15
export const getUseCaseComplexity = (transactions) => {
    if (transactions <= 3) return { level: 'Simple', weight: 5 };
    if (transactions >= 4 && transactions <= 7) return { level: 'Average', weight: 10 };
    return { level: 'Complex', weight: 15 };
};

// --- TCF & EF FACTORS ---
export const TCF_FACTORS = [
    { id: 'T1', name: 'Distributed System', weight: 2 },
    { id: 'T2', name: 'Performance Objectives', weight: 1 },
    { id: 'T3', name: 'End-User Efficiency', weight: 1 },
    { id: 'T4', name: 'Complex Internal Processing', weight: 1 },
    { id: 'T5', name: 'Reusability', weight: 1 },
    { id: 'T6', name: 'Easy to Install', weight: 0.5 },
    { id: 'T7', name: 'Easy to Use', weight: 0.5 },
    { id: 'T8', name: 'Portability', weight: 2 },
    { id: 'T9', name: 'Easy to Change', weight: 1 },
    { id: 'T10', name: 'Concurrency', weight: 1 },
    { id: 'T11', name: 'Special Security Features', weight: 1 },
    { id: 'T12', name: 'Direct Access for Third Parties', weight: 1 },
    { id: 'T13', name: 'User Training Facilities', weight: 1 }
];

export const EF_FACTORS = [
    { id: 'E1', name: 'Familiarity with Project', weight: 1.5 },
    { id: 'E2', name: 'Application Experience', weight: 0.5 },
    { id: 'E3', name: 'Object-Oriented Experience', weight: 1 },
    { id: 'E4', name: 'Lead Analyst Capability', weight: 0.5 },
    { id: 'E5', name: 'Motivation', weight: 1 },
    { id: 'E6', name: 'Stable Requirements', weight: 2 },
    { id: 'E7', name: 'Part-time Workers', weight: -1 },
    { id: 'E8', name: 'Difficulty of Programming Language', weight: -1 }
];

// --- ESTIMATION RATES & PHASES ---
export const ROLE_RATES_2023 = {
    'System Analyst': 28000000,
    'Programmer': 22000000,
    'Project Manager': 35000000,
    'Tester': 18000000
};

export const PHASE_DISTRIBUTION = [
    { name: 'Requirement Analysis', group: 'Software Phase Development', percent: 15, roleName: 'System Analyst', roleId: 'System Analyst' },
    { name: 'System Design', group: 'Software Phase Development', percent: 20, roleName: 'System Analyst', roleId: 'System Analyst' },
    { name: 'Programming/Coding', group: 'Software Phase Development', percent: 40, roleName: 'Programmer', roleId: 'Programmer' },
    { name: 'Deployment', group: 'Ongoing life-cycle activity', percent: 10, roleName: 'Project Manager', roleId: 'Project Manager' },
    { name: 'Testing & QA', group: 'Quality and testing phases', percent: 15, roleName: 'Tester', roleId: 'Tester' }
];

export const BV_OPTIONS = {
    efficiency: [ { label: 'Low', score: 1 }, { label: 'Med', score: 3 }, { label: 'High', score: 5 } ],
    users: [ { label: '<100', score: 1 }, { label: '100-500', score: 3 }, { label: '>500', score: 5 } ],
    regulatory: [ { label: 'None', score: 1 }, { label: 'Recommended', score: 3 }, { label: 'Mandatory', score: 5 } ],
    bia: [ { label: 'Low', score: 1 }, { label: 'Med', score: 3 }, { label: 'High', score: 5 } ]
};

export const EFFORT_OPTIONS = {
    duration: [ { label: '<3 Months', score: 1 }, { label: '3-6 Months', score: 3 }, { label: '>6 Months', score: 5 } ],
    technology: [ { label: 'Existing', score: 1 }, { label: 'New', score: 3 }, { label: 'Experimental', score: 5 } ],
    systems: [ { label: 'None', score: 1 }, { label: '1-2 Systems', score: 3 }, { label: '3+ Systems', score: 5 } ],
    strategy: [ { label: 'Low', score: 1 }, { label: 'Med', score: 3 }, { label: 'High', score: 5 } ]
};