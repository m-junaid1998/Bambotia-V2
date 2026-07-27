
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import CategoriesSection from "@/components/CategoriesSection";
import NewArrivals from "@/components/NewArrivals";
import Testimonials from "@/components/Testimonials";
import ShopTheLook from "@/components/ShopTheLook";
import AutomatedMediaStream from "./AutomatedMediaStream";


const Index = () => (
  <>
    <HeroSection />
    <StatsBar />
    <AutomatedMediaStream/>
    <CategoriesSection />
    <NewArrivals />
    <ShopTheLook/>
    <Testimonials />
  </>
);

export default Index;
