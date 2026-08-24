import Hero from "@/components/home/Hero";
import TrustStats from "@/components/home/TrustStats";
import ProblemSolution from "@/components/home/ProblemSolution";
import LearningSystem from "@/components/home/LearningSystem";
import DriverDay from "@/components/home/DriverDay";
import ProgramsPreview from "@/components/home/ProgramsPreview";
import PracticalLearningTeaser from "@/components/home/PracticalLearningTeaser";
import TeachersTeaser from "@/components/home/TeachersTeaser";
import ProgressTeaser from "@/components/home/ProgressTeaser";
import SuccessStories from "@/components/home/SuccessStories";
import Scholarship from "@/components/home/Scholarship";
import KnowledgeHub from "@/components/home/KnowledgeHub";
import AdmissionCTA from "@/components/home/AdmissionCTA";
import ContactBlock from "@/components/home/ContactBlock";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStats />
      <ProblemSolution />
      <LearningSystem />
      <DriverDay />
      <ProgramsPreview />
      <PracticalLearningTeaser />
      <TeachersTeaser />
      <ProgressTeaser />
      <SuccessStories />
      <Scholarship />
      <KnowledgeHub />
      <AdmissionCTA />
      <ContactBlock />
    </>
  );
}
