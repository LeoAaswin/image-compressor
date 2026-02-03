import { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Terms of Service - OptiPix',
  description: 'Terms of Service for OptiPix image processing tools. Learn about our terms, conditions, and usage guidelines.',
  keywords: ['terms of service', 'terms', 'conditions', 'OptiPix', 'image processing terms'],
  openGraph: {
    title: 'Terms of Service - OptiPix',
    description: 'Terms of Service for OptiPix image processing tools.',
    type: 'website',
    url: '/terms',
  },
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 sm:p-8">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
            
            <div className="prose prose-gray max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">Last Updated: {new Date().toLocaleDateString()}</h2>
                <p className="text-muted-foreground">
                  Welcome to OptiPix! These Terms of Service govern your use of our image processing tools. 
                  By using OptiPix, you agree to these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• By accessing and using OptiPix, you accept and agree to be bound by these Terms of Service.</p>
                  <p>• If you do not agree to these terms, please do not use our services.</p>
                  <p>• We reserve the right to modify these terms at any time, with changes effective immediately upon posting.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Description of Service</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• <strong>Image Compression:</strong> Reduce file sizes while maintaining quality.</p>
                  <p>• <strong>Format Conversion:</strong> Convert between different image formats.</p>
                  <p>• <strong>Image Editing:</strong> Crop, rotate, and apply filters to images.</p>
                  <p>• <strong>Background Removal:</strong> Remove backgrounds from images using AI technology.</p>
                  <p>• <strong>Favicon Generation:</strong> Create favicon sets for websites and applications.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">User Responsibilities</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• You must be at least 13 years old to use our services.</p>
                  <p>• You are responsible for the content you process through our tools.</p>
                  <p>• You must not use our services for any illegal or unauthorized purposes.</p>
                  <p>• You must not attempt to harm, disable, or overburden our services.</p>
                  <p>• You must not use our services to process content that violates any laws or regulations.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Prohibited Uses</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Processing content that is illegal, harmful, threatening, abusive, or otherwise objectionable.</p>
                  <p>• Using our services to violate intellectual property rights.</p>
                  <p>• Attempting to gain unauthorized access to our systems or networks.</p>
                  <p>• Interfering with or disrupting our services or servers.</p>
                  <p>• Using automated tools to access our services excessively.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• <strong>Our Content:</strong> OptiPix and its original content are owned by us and protected by intellectual property laws.</p>
                  <p>• <strong>Your Content:</strong> You retain ownership of the images you process. We do not claim any rights to your content.</p>
                  <p>• <strong>License:</strong> You grant us a limited license to operate and improve our services based on your usage.</p>
                  <p>• <strong>No Storage:</strong> We do not store your images or content permanently.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Privacy and Data</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Your privacy is important to us. Please review our Privacy Policy for details on how we handle your data.</p>
                  <p>• Most processing happens locally in your browser for maximum privacy.</p>
                  <p>• Background removal uses a secure third-party API with no permanent storage.</p>
                  <p>• We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Service Availability</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• We strive to maintain high availability but cannot guarantee 100% uptime.</p>
                  <p>• Services may be temporarily unavailable for maintenance, updates, or technical issues.</p>
                  <p>• We are not liable for any losses resulting from service interruptions.</p>
                  <p>• We may discontinue or modify services at any time.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Disclaimer of Warranties</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• Our services are provided &quot;as is&quot; without any warranties, express or implied.</p>
                  <p>• We do not guarantee that our services will meet your specific requirements.</p>
                  <p>• We do not guarantee error-free operation or uninterrupted service.</p>
                  <p>• You use our services at your own risk.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages.</p>
                  <p>• Our total liability for any claims related to our services shall not exceed the amount you paid (if any) for using our services.</p>
                  <p>• This limitation applies to all claims, whether based on warranty, contract, tort, or any other legal theory.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Indemnification</h2>
                <p className="text-muted-foreground">
                  You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of our services or violation of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Termination</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• We may terminate or suspend your access to our services at any time, for any reason.</p>
                  <p>• You may stop using our services at any time.</p>
                  <p>• Upon termination, your right to use the services ceases immediately.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to conflict of law principles.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• We reserve the right to modify these terms at any time.</p>
                  <p>• Changes will be posted on this page with an updated date.</p>
                  <p>• Your continued use of our services after changes constitutes acceptance of the new terms.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>If you have any questions about these Terms of Service, please contact us:</p>
                  <p>• Email: info@dhakakalasmin.com.np</p>
                  <p>• We will respond to your inquiries within a reasonable time frame.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
