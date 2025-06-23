// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // Define Department type to match the error context
// interface Department {
//   name: string;
//   id: number;
//   lat: number;
//   lng: number;
// }

// async function main() {
//   // Seed Departments with provided lat & lng
//   await prisma.department.createMany({
//     data: [
//       { name: 'Computer Science', lat: 21.1007046, lng: 85.0906913 },
//       { name: 'Electronics Engineering', lat: 21.1007046, lng: 85.0906913 },
//       { name: 'Mechanical Engineering', lat: 21.1007046, lng: 85.0906913 },
//       { name: 'Civil Engineering', lat: 21.1007046, lng: 85.0906913 },
//       { name: 'Electrical Engineering', lat: 21.1007046, lng: 85.0906913 },
//       { name: 'Chemical Engineering', lat: 21.1007046, lng: 85.0906913 },
//       { name: 'Biotechnology', lat: 21.1007046, lng: 85.0906913 },
//     ],
//     skipDuplicates: true,
//   });

//   // Seed Semesters
//   await prisma.semester.createMany({
//     data: Array.from({ length: 8 }, (_, i) => ({
//       name: `Semester ${i + 1}`,
//     })),
//     skipDuplicates: true,
//   });

//   // Fetch departments and semesters for subject creation
//   const departments: Department[] = await prisma.department.findMany();
//   const semesters = await prisma.semester.findMany();

//   // Check if departments and semesters exist
//   if (departments.length === 0 || semesters.length === 0) {
//     throw new Error('No departments or semesters found. Cannot seed subjects.');
//   }

//   // Define department-specific subjects for each semester
//   const departmentSubjects: Record<string, string[][]> = {
//     'Computer Science': [
//       ['Introduction to Programming', 'Digital Logic', 'Mathematics for Computing'], // Sem 1
//       ['Data Structures', 'Computer Organization', 'Discrete Mathematics'], // Sem 2
//       ['Algorithms', 'Operating Systems', 'Database Systems'], // Sem 3
//       ['Object-Oriented Programming', 'Computer Networks', 'Software Engineering'], // Sem 4
//       ['Artificial Intelligence', 'Web Development', 'Theory of Computation'], // Sem 5
//       ['Machine Learning', 'Cloud Computing', 'Compiler Design'], // Sem 6
//       ['Cybersecurity', 'Distributed Systems', 'Data Science'], // Sem 7
//       ['Blockchain Technology', 'Internet of Things', 'Quantum Computing'], // Sem 8
//     ],
//     'Electronics Engineering': [
//       ['Basic Electronics', 'Circuit Theory', 'Engineering Mathematics'], // Sem 1
//       ['Analog Circuits', 'Digital Electronics', 'Signals and Systems'], // Sem 2
//       ['Microprocessors', 'Electromagnetic Fields', 'Control Systems'], // Sem 3
//       ['VLSI Design', 'Communication Systems', 'Electronic Measurements'], // Sem 4
//       ['Embedded Systems', 'Digital Signal Processing', 'Power Electronics'], // Sem 5
//       ['Wireless Communication', 'Microelectronics', 'Antenna Design'], // Sem 6
//       ['IoT in Electronics', 'Robotics', 'Optoelectronics'], // Sem 7
//       ['Satellite Communication', 'Nanoelectronics', 'Automotive Electronics'], // Sem 8
//     ],
//     'Mechanical Engineering': [
//       ['Engineering Mechanics', 'Thermodynamics', 'Engineering Drawing'], // Sem 1
//       ['Strength of Materials', 'Fluid Mechanics', 'Manufacturing Processes'], // Sem 2
//       ['Kinematics of Machines', 'Heat Transfer', 'Machine Design'], // Sem 3
//       ['Dynamics of Machines', 'Thermal Engineering', 'Metrology'], // Sem 4
//       ['Automobile Engineering', 'Finite Element Analysis', 'Refrigeration'], // Sem 5
//       ['Robotics and Automation', 'CAD/CAM', 'Power Plant Engineering'], // Sem 6
//       ['Mechatronics', 'Industrial Engineering', 'Vibration Analysis'], // Sem 7
//       ['Renewable Energy Systems', 'Additive Manufacturing', 'Aerospace Engineering'], // Sem 8
//     ],
//     'Civil Engineering': [
//       ['Surveying', 'Building Materials', 'Engineering Geology'], // Sem 1
//       ['Structural Analysis', 'Fluid Mechanics', 'Construction Technology'], // Sem 2
//       ['Concrete Technology', 'Geotechnical Engineering', 'Hydraulics'], // Sem 3
//       ['Steel Structures', 'Transportation Engineering', 'Environmental Engineering'], // Sem 4
//       ['Foundation Engineering', 'Water Resources', 'Urban Planning'], // Sem 5
//       ['Earthquake Engineering', 'Bridge Design', 'Cost Estimation'], // Sem 6
//       ['Sustainable Construction', 'Pavement Design', 'Remote Sensing'], // Sem 7
//       ['Smart Cities', 'Coastal Engineering', 'Infrastructure Development'], // Sem 8
//     ],
//     'Electrical Engineering': [
//       ['Electrical Circuits', 'Engineering Mathematics', 'Basic Electrical Engineering'], // Sem 1
//       ['Electromagnetic Theory', 'Electrical Machines', 'Power Systems'], // Sem 2
//       ['Control Systems', 'Power Electronics', 'Measurement Techniques'], // Sem 3
//       ['High Voltage Engineering', 'Electric Drives', 'Renewable Energy'], // Sem 4
//       ['Microgrid Systems', 'Digital Control', 'Electrical Safety'], // Sem 5
//       ['Smart Grid Technology', 'HVDC Transmission', 'Energy Management'], // Sem 6
//       ['Electric Vehicles', 'IoT in Power Systems', 'Advanced Power Systems'], // Sem 7
//       ['Wireless Power Transfer', 'Energy Storage Systems', 'Grid Automation'], // Sem 8
//     ],
//     'Chemical Engineering': [
//       ['Chemical Process Calculations', 'Physical Chemistry', 'Engineering Mathematics'], // Sem 1
//       ['Fluid Mechanics', 'Heat Transfer', 'Chemical Thermodynamics'], // Sem 2
//       ['Mass Transfer', 'Reaction Engineering', 'Process Control'], // Sem 3
//       ['Separation Processes', 'Plant Design', 'Biochemical Engineering'], // Sem 4
//       ['Polymer Technology', 'Environmental Engineering', 'Process Optimization'], // Sem 5
//       ['Petroleum Refining', 'Nanotechnology', 'Safety Engineering'], // Sem 6
//       ['Green Chemistry', 'Energy Systems', 'Computational Fluid Dynamics'], // Sem 7
//       ['Biorefinery', 'Process Modeling', 'Industrial Catalysis'], // Sem 8
//     ],
//     'Biotechnology': [
//       ['Cell Biology', 'Biochemistry', 'Microbiology'], // Sem 1
//       ['Genetics', 'Molecular Biology', 'Bioprocess Engineering'], // Sem 2
//       ['Immunology', 'Bioinformatics', 'Enzyme Technology'], // Sem 3
//       ['Genetic Engineering', 'Bioprocess Control', 'Biostatistics'], // Sem 4
//       ['Plant Biotechnology', 'Animal Biotechnology', 'Biosensors'], // Sem 5
//       ['Synthetic Biology', 'Biomedical Engineering', 'Fermentation Technology'], // Sem 6
//       ['Genomics', 'Proteomics', 'Bioethics'], // Sem 7
//       ['Industrial Biotechnology', 'Nanobiotechnology', 'Regenerative Medicine'], // Sem 8
//     ],
//   };

//   // Seed Subjects (3 subjects per semester per department)
//   const subjectsData = departments.flatMap((dept: Department) => {
//     // Ensure dept and departmentSubjects[dept.name] are defined
//     if (!dept || !departmentSubjects[dept.name]) {
//       console.warn(`No subjects defined for department: ${dept?.name || 'undefined'}`);
//       return [];
//     }

//     return semesters.flatMap((semester, sIdx) => {
//       const subjects = departmentSubjects[dept.name][sIdx] || [];
//       if (subjects.length === 0) {
//         console.warn(`No subjects for ${dept.name} in Semester ${semester.name}`);
//         return [];
//       }

//       return subjects.map((name) => ({
//         name,
//         departmentId: dept.id,
//         semesterId: semester.id,
//       }));
//     });
//   });

//   await prisma.subject.createMany({
//     data: subjectsData,
//     skipDuplicates: true,
//   });

//   console.log('✅ Seeded departments, semesters, and subjects');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Seed error:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });