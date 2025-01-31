import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Heart, Moon } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen pattern-bg overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage-100/80 to-sand-100/80 dark:from-sage-900/80 dark:to-sand-900/80" />
        <div className="absolute inset-0 bg-geometric-pattern opacity-5" />
        
        {/* Floating Icons */}
        <Moon className="absolute top-1/4 left-1/4 text-sage-400 animate-float opacity-30 w-12 h-12" />
        <Book className="absolute top-1/3 right-1/4 text-sand-400 animate-float [animation-delay:1s] opacity-30 w-12 h-12" />
        <Heart className="absolute bottom-1/4 left-1/3 text-sage-400 animate-float [animation-delay:2s] opacity-30 w-12 h-12" />

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sage-600 to-sand-600 dark:from-sage-400 dark:to-sand-400 animate-fadeIn">
              Quran Tadabbur
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground animate-fadeIn [animation-delay:200ms]">
              Reflect on the Divine Words with Depth and Understanding
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn [animation-delay:400ms]">
            <div className="glass rounded-lg p-6 card-hover fancy-border">
              <h3 className="font-semibold text-lg mb-2">Scan Ayat</h3>
              <p className="text-sm text-muted-foreground">Easily capture and analyze Quranic verses</p>
            </div>
            <div className="glass rounded-lg p-6 card-hover fancy-border">
              <h3 className="font-semibold text-lg mb-2">Deep Reflection</h3>
              <p className="text-sm text-muted-foreground">Understand the deeper meanings and context</p>
            </div>
            <div className="glass rounded-lg p-6 card-hover fancy-border">
              <h3 className="font-semibold text-lg mb-2">Save Insights</h3>
              <p className="text-sm text-muted-foreground">Keep track of your personal reflections</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="animate-fadeIn [animation-delay:600ms]">
            <Link to="/home">
              <Button size="lg" className="group">
                Begin Your Journey
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;