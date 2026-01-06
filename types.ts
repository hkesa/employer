export type Language = 'zh' | 'en';

export interface FamilyMember {
  id: string;
  name: string;
  yob: string;
  relation: string;
  relationOther: string;
  hkid: string;
}

export interface OldHelper {
  id: string;
  name: string;
  hkid: string;
  contractNo: string;
  visaExpiry: string;
  employer: string;
  arrangement: string;
  handoverDays: string;
}

export interface FormData {
  employerName: string;
  address: string;
  housingType: string;
  houseSize: string;
  bedrooms: string;
  nationality: string;
  occupation: string;
  income: string;
  
  // Room details
  roomArrangement: string;
  roomSize: string; // If separate
  roomShareChild: string; // If share with child
  roomOther: string; // If other

  // Salary & Food
  salaryType: string;
  salaryOtherAmount: string;
  foodAllowance: string;
  foodAllowanceAmount: string;

  // Application Type
  appType: string;
  
  // Local specifics
  localWorkArrangement: string;
  localVacationDays: string;

  // Overseas specifics
  overseasWorkArrangement: string;
  overseasArrivalMonth: string;

  // Family
  familyCount: string;
  familyMembers: FamilyMember[];

  // Baby
  expectingBaby: string;
  babyDueDateMonth: string;
  babyGender: string;

  // Other Helpers
  hasOtherHelpers: string;
  oldHelperCount: string;
  oldHelpers: OldHelper[];

  // Pets & Car
  carWash: string;
  hasDogs: string;
  dogCount: string;
  hasCats: string;
  catCount: string;
  hasOtherPets: string;
  otherPetDetails: string;

  // Remarks
  remarks: string;
}

export const INITIAL_DATA: FormData = {
  employerName: '',
  address: '',
  housingType: '',
  houseSize: '',
  bedrooms: '',
  nationality: '',
  occupation: '',
  income: '',
  roomArrangement: '',
  roomSize: '',
  roomShareChild: '',
  roomOther: '',
  salaryType: '',
  salaryOtherAmount: '',
  foodAllowance: '',
  foodAllowanceAmount: '',
  appType: '',
  localWorkArrangement: '',
  localVacationDays: '',
  overseasWorkArrangement: '',
  overseasArrivalMonth: '',
  familyCount: '',
  familyMembers: [],
  expectingBaby: '',
  babyDueDateMonth: '',
  babyGender: '',
  hasOtherHelpers: '',
  oldHelperCount: '',
  oldHelpers: [],
  carWash: '',
  hasDogs: '',
  dogCount: '',
  hasCats: '',
  catCount: '',
  hasOtherPets: '',
  otherPetDetails: '',
  remarks: ''
};