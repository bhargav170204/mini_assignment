import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Full-Stack Authentication System
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Secure role-based authentication with beautiful dashboards. Built with React, TypeScript, and modern best practices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-medium hover:shadow-glow transition-all gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="gap-2">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto" style={{ animationDelay: '0.2s' }}>
          <div className="text-center p-6 rounded-lg border bg-card shadow-soft hover:shadow-medium transition-all animate-fade-in">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary mb-4">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Authentication</h3>
            <p className="text-sm text-muted-foreground">
              JWT-based authentication with bcrypt password hashing and secure session management
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border bg-card shadow-soft hover:shadow-medium transition-all animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent mb-4">
              <Users className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
            <p className="text-sm text-muted-foreground">
              Granular permissions with user and admin roles, each with dedicated dashboard experiences
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border bg-card shadow-soft hover:shadow-medium transition-all animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary mb-4">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Modern Stack</h3>
            <p className="text-sm text-muted-foreground">
              Built with React, TypeScript, Tailwind CSS, and PostgreSQL for performance and scalability
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
