type Division = {
    id: string;
    division: string;
    dept_id?: string; // Optional field for department ID
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};

type Department = {
    id: string;
    department: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};