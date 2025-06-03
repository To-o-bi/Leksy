import HeroBanner from '../../components/consultation/HeroBanner';
import Form from '../../components/consultation/form';
import WhyUs from '../../components/consultation/WhyUs';
import HowItworks from '../../components/consultation/HowItworks';
import FAQ from '../../components/consultation/FAQ';
import CTA from '../../components/consultation/CTA';
// import Button from '../components/common/Button';

const ConsultationPage = () => {  

  return (
    <div>
      <HeroBanner />

      <Form />
      
      <WhyUs />

      <HowItworks />

      <FAQ />
      
      <CTA />
      
    </div>
  );
};

export default ConsultationPage;