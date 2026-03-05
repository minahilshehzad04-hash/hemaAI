"use client";
import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import Link from "next/link";
import {
  Heart,
  Brain,
  Zap,
  Shield,
  Target,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  Calendar,
  Phone,
  ArrowRight,
  Award,
  ShieldCheck,
  Stethoscope,
  FileText,
  Video,
  Download,
  PlayCircle,
  X,
  Youtube,
  ExternalLink
} from "lucide-react";

// Import professional PDF content
import { professionalPDFContent, getFileName, getSuccessMessage } from "./cancerGuide";

const Homepage = () => {
  const sectionRefs = useRef([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showLiveSessionModal, setShowLiveSessionModal] = useState(false);
  const [downloadedResources, setDownloadedResources] = useState(new Set());
  const [pdfBlobs, setPdfBlobs] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  // PROFESSIONAL PDF Download Function using imported content
  const handleDownloadGuide = (resourceType = 'blood-cancer-guide') => {
    const resourceId = resourceType;

    if (downloadedResources.has(resourceId)) {
      alert('📚 You have already downloaded this guide. Check your downloads folder.');
      return;
    }

    setDownloadedResources(prev => new Set(prev).add(resourceId));

    const doc = new jsPDF();

    let yPosition = 20;
    const margin = 20;
    const pageHeight = doc.internal.pageSize.height;

    // Add professional header
    doc.setFillColor(10, 30, 60);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("HEMA AI - CONFIDENTIAL MEDICAL DOCUMENT", 105, 10, null, null, "center");

    doc.setTextColor(0, 0, 0);
    yPosition = 25;

    // Use imported professional content
    professionalPDFContent[resourceType].forEach((section, index) => {
      // Check for page break
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      if (section.title) {
        doc.setFontSize(section.fontSize);
        doc.setTextColor(section.color[0], section.color[1], section.color[2]);
        doc.setFont("helvetica", "bold");

        // Center the main title
        if (section.isTitle) {
          doc.text(section.title, 105, yPosition, null, null, "center");
          yPosition += 10;
        } else {
          doc.text(section.title, margin, yPosition);
          yPosition += 8;
        }
      }

      if (section.body) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        const bodyLines = doc.splitTextToSize(section.body, 170);
        doc.text(bodyLines, margin, yPosition);
        yPosition += (bodyLines.length * 6) + 12;
      }

      // Add section separator for non-title sections
      if (!section.isTitle && index < professionalPDFContent[resourceType].length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, 210 - margin, yPosition);
        yPosition += 15;
      }
    });

    // Add professional footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("This document contains proprietary medical information developed by HemaAI Healthcare Technologies.", margin, pageHeight - 25);
    doc.text("For medical decisions, consult qualified healthcare professionals. Content based on current medical evidence.", margin, pageHeight - 20);
    doc.text(`HemaAI Healthcare Technologies © ${new Date().getFullYear()} | www.hemaai.com | +92 300 123 4567`, 105, pageHeight - 10, null, null, "center");

    // Save PDF for download
    const fileName = getFileName(resourceType);
    doc.save(fileName);

    // Save PDF blob for viewing
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfBlobs(prev => ({ ...prev, [resourceType]: pdfUrl }));

    // Show professional success message
    alert(getSuccessMessage(resourceType));
  };

  // Function to play motivational video
  const handlePlayVideo = () => {
    setShowVideoModal(true);
  };

  // Function to join live session
  const handleJoinSession = () => {
    setShowLiveSessionModal(true);
  };

  // Mock live session data
  const liveSessions = [
    {
      id: 1,
      title: "Coping with Chemotherapy",
      time: "Saturday 10:00 AM",
      expert: "Dr. Sarah Khan",
      description: "Learn strategies to manage side effects and maintain quality of life during treatment."
    },
    {
      id: 2,
      title: "Nutrition During Treatment",
      time: "Sunday 3:00 PM",
      expert: "Nutritionist Ayesha",
      description: "Dietary guidelines to support your body through cancer treatment and recovery."
    },
    {
      id: 3,
      title: "Family Support Strategies",
      time: "Friday 6:00 PM",
      expert: "Psychologist Dr. Ali",
      description: "How families can provide emotional support while taking care of their own wellbeing."
    }
  ];

  // Educational resources data - REMOVED Support Group Sessions and Patient Resources
  const educationalResources = [
    {
      icon: FileText,
      title: "Blood Cancer Guide",
      description: "Complete guide to understanding symptoms, diagnosis, and treatment options",
      type: "PDF Guide",
      action: () => handleDownloadGuide('blood-cancer-guide'),
      buttonText: "Download Guide",
      buttonIcon: Download,
      disabled: downloadedResources.has('blood-cancer-guide')
    },
    {
      icon: Video,
      title: "Early Detection Webinar",
      description: "Learn how AI is revolutionizing early cancer detection in Pakistan",
      type: "Video",
      action: handlePlayVideo,
      buttonText: "Watch Video",
      buttonIcon: PlayCircle
    },
    {
      icon: FileText,
      title: "Treatment Options",
      description: "Comprehensive overview of available treatments and therapies",
      type: "PDF Guide",
      action: () => handleDownloadGuide('treatment-options'),
      buttonText: "Download Guide",
      buttonIcon: Download,
      disabled: downloadedResources.has('treatment-options')
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">Blood Cancer Awareness & Motivation</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-gray-900">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <PlayCircle className="w-12 h-12" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4">Blood Cancer: Hope & Healing</h4>
                  <p className="text-lg mb-6 opacity-90 max-w-2xl">
                    Watch inspiring stories of survivors and learn about the latest advancements in blood cancer treatment.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => window.open('https://www.youtube.com/results?search_query=blood+cancer+survivor+stories+motivation', '_blank')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-colors flex items-center gap-2"
                    >
                      <Youtube className="w-5 h-5" />
                      Watch Survivor Stories
                    </button>
                    <button
                      onClick={() => window.open('https://www.youtube.com/results?search_query=blood+cancer+treatment+advancements', '_blank')}
                      className="border border-white hover:bg-white hover:text-gray-900 text-white px-6 py-3 rounded-full font-semibold transition-colors flex items-center gap-2"
                    >
                      <Video className="w-5 h-5" />
                      Medical Advances
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Session Modal */}
      {showLiveSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">Join Support Group Sessions</h3>
              <button
                onClick={() => setShowLiveSessionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Weekly Virtual Meetings</h4>
                    <p className="text-blue-700 text-sm">
                      Connect with patients, caregivers, and healthcare professionals in our supportive community.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="font-bold text-gray-900 text-lg">Upcoming Sessions</h4>
                {liveSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                        {session.title}
                      </h5>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Upcoming
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                      {session.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-4 h-4" />
                          {session.expert}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        alert(`🎉 Successfully registered for:\n\n"${session.title}"\n\n📅 ${session.time}\n👨‍⚕️ Hosted by: ${session.expert}\n\n💌 Meeting details will be sent to your email 1 hour before the session.\n\nWe look forward to seeing you there!`);
                        setShowLiveSessionModal(false);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 duration-200"
                    >
                      Register for This Session
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Blood Cancer Problem Statement */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div
            ref={addToRefs}
            className="text-center mb-16 transform transition-all duration-700 opacity-0 translate-y-8"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The <span className="text-red-600 animate-pulse">Blood Cancer</span> Challenge in Pakistan
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Every year, thousands of Pakistanis face delayed diagnosis and limited access to specialized care for blood cancers.
              HemaAI bridges this critical gap with intelligent solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                bgColor: "bg-red-100",
                iconColor: "text-red-600",
                title: "Late Diagnosis",
                description: "60% of blood cancer cases are diagnosed at advanced stages due to limited screening facilities."
              },
              {
                icon: Users,
                bgColor: "bg-blue-100",
                iconColor: "text-blue-600",
                title: "Specialist Shortage",
                description: "Limited hematologists and oncologists in rural areas lead to treatment delays."
              },
              {
                icon: BarChart3,
                bgColor: "bg-green-100",
                iconColor: "text-green-600",
                title: "Data Gap",
                description: "Lack of centralized data makes personalized treatment planning challenging."
              }
            ].map((item, index) => (
              <div
                key={index}
                ref={addToRefs}
                className="bg-white p-8 rounded-xl shadow-lg text-center transform transition-all duration-700 opacity-0 translate-y-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-16 h-16 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce`}>
                  <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: HemaAI Solution */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                ref={addToRefs}
                className="text-4xl font-bold text-gray-900 mb-6 transform transition-all duration-700 opacity-0 translate-y-8"
              >
                How <span className="text-blue-600 animate-pulse">HemaAI</span> Transforms Blood Cancer Care
              </h2>

              <div className="space-y-6 mt-15">
                {[
                  {
                    icon: Brain,
                    bgColor: "bg-blue-100",
                    iconColor: "text-blue-600",
                    title: "AI-Powered Early Detection",
                    description: "Advanced algorithms analyze blood test patterns to identify cancer markers months before traditional methods."
                  },
                  {
                    icon: Target,
                    bgColor: "bg-green-100",
                    iconColor: "text-green-600",
                    title: "Precision Diagnosis",
                    description: "Machine learning models classify blood cancer subtypes with 95%+ accuracy for targeted treatment."
                  },
                  {
                    icon: Zap,
                    bgColor: "bg-purple-100",
                    iconColor: "text-purple-600",
                    title: "Smart Patient Matching",
                    description: "Connect patients with specialized doctors and blood donors based on real-time needs and compatibility."
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    ref={addToRefs}
                    className="flex items-start gap-4 transform transition-all duration-700 opacity-0 translate-x-8 hover:scale-105 transition-transform duration-300"
                  >
                    <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse`}>
                      <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={addToRefs}
              className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 transform transition-all duration-700 opacity-0 scale-95 hover:scale-100 transition-transform duration-500"
            >
              <img
                src="https://www.fmiblog.com/wp-content/uploads/2024/06/Blood-Cancer-Treatment-Market-1-1024x576.jpg"
                alt="HemaAI Blood Cancer Analysis"
                className="rounded-lg w-full h-auto shadow-2xl animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: For Patients */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div
            ref={addToRefs}
            className="text-center mb-16 transform transition-all duration-700 opacity-0 translate-y-8"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              For <span className="text-blue-600 animate-pulse">Patients</span> & Families
            </h2>
            <p className="text-xl text-gray-600">Comprehensive support throughout your cancer journey</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Risk Assessment", desc: "AI-powered screening for early detection" },
              { icon: CheckCircle, title: "Second Opinion", desc: "Get verified diagnoses from specialists" },
              { icon: Users, title: "Care Team", desc: "Connect with hematologists and oncologists" },
              { icon: Heart, title: "Support Network", desc: "Join patient communities for emotional support" }
            ].map((item, index) => (
              <div
                key={index}
                ref={addToRefs}
                className="bg-white p-6 rounded-xl shadow-lg text-center transform transition-all duration-700 opacity-0 translate-y-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-10 h-10 text-blue-600 mx-auto mb-3 animate-heartbeat" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: For Doctors */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div
            ref={addToRefs}
            className="text-center mb-16 transform transition-all duration-700 opacity-0 translate-y-8"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              For <span className="text-blue-600 animate-pulse">Healthcare Professionals</span>
            </h2>
            <p className="text-xl text-gray-600">Advanced tools for better patient outcomes</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3
                ref={addToRefs}
                className="text-2xl font-bold text-gray-900 mb-6 transform transition-all duration-700 opacity-0 translate-x-8"
              >
                Diagnostic Support
              </h3>
              <ul className="space-y-4">
                {[
                  "AI-assisted blood smear analysis",
                  "Predictive analytics for treatment response",
                  "Real-time collaboration with specialists"
                ].map((item, index) => (
                  <li
                    key={index}
                    ref={addToRefs}
                    className="flex items-center gap-3 transform transition-all duration-700 opacity-0 translate-x-8 hover:translate-x-2 transition-transform duration-300"
                  >
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3
                ref={addToRefs}
                className="text-2xl  font-bold text-gray-900 mb-6 transform transition-all duration-700 opacity-0 translate-x-8"
              >
                Patient Management
              </h3>
              <ul className="space-y-4">
                {[
                  "Digital health records integration",
                  "Automated follow-up and monitoring",
                  "Clinical decision support system"
                ].map((item, index) => (
                  <li
                    key={index}
                    ref={addToRefs}
                    className="flex items-center gap-3 transform transition-all duration-700 opacity-0 translate-x-8 hover:translate-x-2 transition-transform duration-300"
                  >
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* UPDATED SECTION: Resources & Education with Professional PDF Download */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div
            ref={addToRefs}
            className="text-center mb-16 transform transition-all duration-700 opacity-0 translate-y-8"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Medical <span className="text-blue-600 animate-pulse animate-pulse">Resources</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive blood cancer resources developed by medical professionals for patients, families, and healthcare providers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {educationalResources.map((resource, index) => (
              <div
                key={index}
                ref={addToRefs}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 group"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 ${resource.buttonIcon === Download ? "bg-blue-100" :
                    resource.buttonIcon === PlayCircle ? "bg-red-100" : "bg-green-100"
                    } rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    <resource.icon className={`w-6 h-6 ${resource.buttonIcon === Download ? "text-blue-600" :
                      resource.buttonIcon === PlayCircle ? "text-red-600" : "text-green-600"
                      }`} />
                  </div>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${resource.buttonIcon === Download ? "bg-blue-100 text-blue-600" :
                      resource.buttonIcon === PlayCircle ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      }`}>
                      {resource.type}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{resource.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{resource.description}</p>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-500">
                    {resource.pages || resource.duration || resource.schedule}
                  </span>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    {/* Download PDF */}
                    {resource.type === "PDF Guide" && (
                      <button
                        onClick={resource.action}
                        disabled={resource.disabled}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${resource.disabled
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                          } transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100`}
                      >
                        <resource.buttonIcon className="w-4 h-4" />
                        {resource.disabled ? "Downloaded" : resource.buttonText}
                      </button>
                    )}

                    {/* View PDF */}
                    {resource.type === "PDF Guide" && (
                      <button
                        onClick={() => {
                          const resourceIdMap = {
                            "Blood Cancer Guide": "blood-cancer-guide",
                            "Patient Resources": "patient-resources",
                            "Treatment Options": "treatment-options"
                          };
                          const key = resourceIdMap[resource.title];
                          if (pdfBlobs[key]) {
                            window.open(pdfBlobs[key], "_blank");
                          } else {
                            resource.action();
                            setTimeout(() => {
                              if (pdfBlobs[key]) window.open(pdfBlobs[key], "_blank");
                            }, 500);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </button>
                    )}

                    {/* Video / Live Session button */}
                    {resource.type !== "PDF Guide" && (
                      <button
                        onClick={resource.action}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${resource.buttonIcon === PlayCircle
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                          } transition-all duration-300 transform hover:scale-105`}
                      >
                        <resource.buttonIcon className="w-4 h-4" />
                        {resource.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 animate-blueShift overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div
            ref={addToRefs}
            className="text-center text-white transform transition-all duration-700 opacity-0 translate-y-8"
          >
            <h2 className="text-4xl font-bold mb-6">
              Start Your Journey to Better Health Today
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of patients and healthcare professionals using HemaAI to combat blood cancer
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {/* Book Consultation Button */}
              <Link href="/login" passHref>
                <button
                  className="bg-white text-[#1976D2] px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Calendar className="w-5 h-5" />
                  Book Free Consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: ShieldCheck, text: "Medical Certified" },
                { icon: Award, text: "Award Winning Technology" },
                { icon: Users, text: "Trusted by Hospitals" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center justify-center gap-3 text-white opacity-90">
                  <feature.icon className="w-5 h-5" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-heartbeat {
          animation: heartbeat 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Homepage;