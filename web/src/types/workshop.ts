export type WorkshopJobStage =
  | 'devis'       // 1. Métré & Devis
  | 'debitage'    // 2. Débitage profilés & tôles
  | 'usinage'     // 3. Usinage & Fraisage
  | 'assemblage'  // 4. Assemblage & Vitrage
  | 'pose'        // 5. Pose sur chantier
  | 'termine';    // 6. Livré & Réceptionné

export type JobPriority = 'normal' | 'urgent' | 'critique';

export interface WorkshopJob {
  id: string;
  clientName: string;
  clientPhone: string;
  wilaya: string;
  stage: WorkshopJobStage;
  itemCount: number;
  description: string;
  totalAmountDzd: number;
  depositDzd: number;
  dueDate: string;
  createdAt: string;
  priority: JobPriority;
  profileSystem?: string;
  notes?: string;
}

export interface WorkshopSettings {
  hourlyRateDzd: number;
  targetMarginPercent: number;
  sawKerfMm: number;
  standardBarLengthMm: number;
  energyOverheadPercent: number;
  deliveryBaseDzd: number;
  workshopName: string;
  workshopPhone: string;
  workshopWilaya: string;
}
