import { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - OptiPix',
  description: 'Privacy Policy for OptiPix image processing tools. Learn how we handle your data, ensure privacy, and protect your information.',
  keywords: ['privacy policy', 'data protection', 'privacy', 'OptiPix', 'image processing privacy'],
  openGraph: {
    title: 'Privacy Policy - OptiPix',
    description: 'Privacy Policy for OptiPix image processing tools.',
    type: 'website',
    url: '/privacy',
  },
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-6 sm:p-8">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            
            <div className="prose prose-gray max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">Last Updated: {new Date().toLocaleDateString()}</h2>
                <p className="text-muted-foreground">
                  At OptiPix, we are committed to protecting your privacy and ensuring the security of your data. 
                  This Privacy Policy explains how we handle your information when you use our image processing tools.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Information We Don&apos;t Collect</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• <strong>No Server Uploads:</strong> All image processing happens locally in your browser. Your images never leave your device.</p>
                  <p>• <strong>No Personal Data:</strong> We don&apos;t collect, store, or process any personal information.</p>
                  <p>• <strong>No Tracking:</strong> We don&apos;t use tracking cookies or analytics that compromise your privacy.</p>
                  <p>• <strong>No Accounts Required:</strong> You can use all our tools without creating an account or providing any personal details.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">How Our Tools Work</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• <strong>Client-Side Processing:</strong> All image compression, conversion, editing, and favicon generation happens entirely in your web browser.</p>
                  <p>• <strong>No Data Transmission:</strong> Your images are never transmitted to our servers or any third-party services (except for background removal, which uses a secure API).</p>
                  <p>• <strong>Temporary Storage:</strong> Images are only stored temporarily in your browser&apos;s memory during processing and are automatically cleared when you close the tab.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Background Removal Service</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• <strong>Optional Service:</strong> Background removal is the only feature that requires server communication.</p>
                  <p>• <strong>Secure API:</strong> We use a secure, reputable third-party API service for background removal.</p>
                  <p>• <strong>No Storage:</strong> Images sent for background removal are not stored permanently and are processed immediately.</p>
                  <p>• <strong>Your Choice:</strong> You can choose not to use the background removal feature if you prefer complete offline processing.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Browser Storage</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• <strong>Local Storage:</strong> We may use browser local storage to save your preferences (like theme settings).</p>
                  <p>• <strong>Session Storage:</strong> Temporary data during processing is stored in session memory and cleared when the session ends.</p>
                  <p>• <strong>No Persistent Data:</strong> We don&apos;t store any images or personal information in browser storage.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• <strong>Background Removal API:</strong> We use Remove.bg API for background removal functionality.</p>
                  <p>• <strong>Privacy Compliance:</strong> Our third-party services are selected based on their privacy and security standards.</p>
                  <p>• <strong>No Data Sharing:</strong> We don&apos;t share your information with any third parties for marketing purposes.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Security</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>• <strong>HTTPS Encryption:</strong> All communications are encrypted using HTTPS.</p>
                  <p>• <strong>Secure APIs:</strong> Any external API calls use secure, authenticated connections.</p>
                  <p>• <strong>Regular Updates:</strong> We keep our dependencies and security measures up to date.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Children&apos;s Privacy</h2>
                <p className="text-muted-foreground">
                  Our services are not directed to children under 13. We don&apos;t knowingly collect personal information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>If you have any questions about this Privacy Policy, please contact us:</p>
                  <p>• Email: info@dhakakalasmin.com.np</p>
                  <p>• We will respond to your privacy concerns within 30 days.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
