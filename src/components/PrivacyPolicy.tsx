import React from 'react';
import { Search, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-0">
              <button 
                onClick={onBack}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logo.png" 
                  alt="InsightSnap Logo" 
                  className="w-16 h-16"
                />
              </button>
              <h3 className="text-xl font-bold">InsightSnap</h3>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy for InsightSnap</h1>
          <p className="text-gray-600 mb-8">Last Updated: August 24, 2025</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 mb-6">
              InsightSnap ("we," "our," or "us") operates the InsightSnap web application (the "Service"), which helps users generate content ideas, trending topics, and pain points by analyzing publicly available data from platforms like Twitter, Reddit, YouTube, and LinkedIn.
            </p>

            <p className="text-gray-700 mb-8">
              This Privacy Policy describes how we collect, use, and handle information when you use our Service, including when you register for an account and subscribe to our paid plans.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect from You</h2>
            <p className="text-gray-700 mb-4">
              To provide and enhance your experience with InsightSnap, we collect the following types of information:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Registration Information:</h3>
            <p className="text-gray-700 mb-4">When you create an account, we collect:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li><strong>Email Address:</strong> Your primary identifier for your InsightSnap account.</li>
              <li><strong>Password:</strong> If you register using a traditional email and password method.</li>
              <li><strong>Third-Party OAuth IDs:</strong> If you choose to log in via Facebook, Twitter, or Google, we receive an OAuth ID from that platform. This ID allows us to authenticate your account without storing your third-party login credentials. We may also receive your name and profile picture associated with that third-party account, depending on their privacy settings and the permissions you grant.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Information:</h3>
            <p className="text-gray-700 mb-4">
              When you subscribe to a paid plan, payment processing is handled by a third-party payment processor. We do not directly collect or store your full credit card details. Instead, we receive confirmation of your subscription and payment status from our processor. The payment processor collects and processes your payment card information in accordance with their own privacy policy.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Search Keywords:</h3>
            <p className="text-gray-700 mb-4">
              When you submit a keyword to our Service, we process this keyword to fetch data from third-party APIs. These keywords are associated with your user account to track your usage and deliver services, but they are not used to identify you personally in any public facing context.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Data and Analytics:</h3>
            <p className="text-gray-700 mb-6">
              We automatically collect anonymous, aggregated data about how the Service is accessed and used ("Usage Data"). This may include your computer's Internet Protocol (IP) address (anonymized), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data. This data is collected to improve the Service's performance and user experience.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li><strong>To Provide and Maintain the Service:</strong> To deliver the content ideas and insights you request, manage your free trial usage, and provide access to your subscribed features.</li>
              <li><strong>To Manage Your Account:</strong> To create, maintain, and secure your user account, including authenticating your identity for login.</li>
              <li><strong>Subscription and Billing:</strong> To process your subscription payments through our third-party payment processor and manage your active plan.</li>
              <li><strong>To Improve Our Service:</strong> To understand how the Service is used, identify popular features, and enhance its functionality and performance.</li>
              <li><strong>To Monitor Usage:</strong> To track free trial usage, detect, prevent, and address technical issues, and enforce our Terms and Conditions.</li>
              <li><strong>To Communicate with You:</strong> To send you service-related notifications, updates, and customer support messages.</li>
              <li><strong>For Security:</strong> To protect the security and integrity of our Service and our users.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Share Information</h2>
            <p className="text-gray-700 mb-4">We may share your information in the following circumstances:</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Service Providers:</h3>
            <p className="text-gray-700 mb-4">We use third-party companies and individuals to facilitate our Service, including:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li><strong>Payment Processors:</strong> To handle subscription payments securely.</li>
              <li><strong>Analytics Providers:</strong> To help us monitor and analyze the use of our Service (e.g., Google Analytics).</li>
              <li><strong>Authentication Providers:</strong> When you use Facebook, Twitter, or Google to log in, those platforms act as third-party authentication providers.</li>
            </ul>
            <p className="text-gray-700 mb-6">
              These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Requirements:</h3>
            <p className="text-gray-700 mb-4">
              We may disclose your Personal Data where required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Transfers:</h3>
            <p className="text-gray-700 mb-4">
              If InsightSnap is involved in a merger, acquisition, or asset sale, your Personal Data may be transferred. We will provide notice before your Personal Data is transferred and becomes subject to a different Privacy Policy.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">With Your Consent:</h3>
            <p className="text-gray-700 mb-6">
              We may disclose your Personal Data for any other purpose with your consent.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Retention</h2>
            <p className="text-gray-700 mb-6">
              We retain your Personal Data, such as your email address and OAuth IDs, for as long as your account is active or as needed to provide you with the Service. We will also retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
            </p>
            <p className="text-gray-700 mb-6">
              Anonymous Usage Data may be retained for a reasonable period necessary to fulfill the purposes outlined in this Privacy Policy, after which it is deleted or further anonymized.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Security of Data</h2>
            <p className="text-gray-700 mb-6">
              The security of your data is important to us. We implement commercially reasonable measures to protect your Personal Data from unauthorized access, use, or disclosure. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee its absolute security.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party API Data and Login Providers</h2>
            <p className="text-gray-700 mb-4">InsightSnap fetches content data from publicly available APIs of platforms like Twitter, Reddit, YouTube, and LinkedIn. This means:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>The content ideas and trends you receive are based on information made public by users of those respective platforms.</li>
              <li>Your use of InsightSnap and its interactions with these third-party platforms are subject to their respective privacy policies and terms of service. We encourage you to review them.</li>
              <li>InsightSnap is not responsible for the privacy practices or content of these third-party platforms.</li>
            </ul>
            <p className="text-gray-700 mb-6">
              When you use third-party login providers (Facebook, Twitter, Google), you are granting us access to certain information from those accounts. We only access the information necessary for authentication as allowed by your privacy settings on those platforms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Data Protection Rights</h2>
            <p className="text-gray-700 mb-4">Depending on your location, you may have the following data protection rights:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
              <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
              <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
              <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
              <li><strong>The right to object to processing:</strong> You have the right to object to our processing of your personal data, under certain conditions.</li>
              <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
            </ul>
            <p className="text-gray-700 mb-6">
              To exercise any of these rights, please contact us using the details below. We will respond to your request within a reasonable timeframe.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 mb-6">
              Our Service is not intended for use by anyone under the age of 13 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 mb-4">If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li><strong>By email:</strong> contact@insightsnap.co</li>
              <li><strong>By visiting this page on our website:</strong> Contact Page</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
