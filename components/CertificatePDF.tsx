import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Svg, Path, G } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 24, // Strict bounds to guarantee 1-page output
  },
  // ELITE GEOMETRIC BORDER SYSTEM
  borderOuter: {
    flex: 1,
    border: '4pt solid #0B1F42', // Rich Navy
    padding: 4,
  },
  borderMiddle: {
    flex: 1,
    border: '1pt solid #C5A059', // Outer Gold Thin Accent
    padding: 3,
  },
  borderInner: {
    flex: 1,
    border: '1pt solid #C5A059', // Inner Gold Thin Accent
    backgroundColor: '#FCFAF5', // Premium warm cream tone
    paddingTop: 45,
    paddingBottom: 35,
    paddingHorizontal: 60,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative', 
  },

  // VECTOR CORNER DECORATIONS
  cornerTag: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  topLeft: { top: 10, left: 10 },
  topRight: { top: 10, right: 10 },
  bottomLeft: { bottom: 10, left: 10 },
  bottomRight: { bottom: 10, right: 10 },

  // HEADER TYPOGRAPHY
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 5,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Times-Bold',
    color: '#0B1F42',
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#C5A059',
    letterSpacing: 7,
    textTransform: 'uppercase',
  },

  // CORE CREDENTIAL DISPLAY
  bodyContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  presentedTo: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#64748B',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  name: {
    fontSize: 54,
    fontFamily: 'Times-Italic',
    color: '#0F172A',
    marginBottom: 8,
  },
  nameLine: {
    width: 460,
    height: 1,
    backgroundColor: '#CBD5E1',
    marginBottom: 30,
  },
  bodyText: {
    fontSize: 14.5,
    fontFamily: 'Times-Roman',
    color: '#334155',
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 1.6,
  },
  hoursHighlight: {
    fontSize: 22,
    fontFamily: 'Times-Bold',
    color: '#0B1F42',
    marginVertical: 10,
    letterSpacing: 1,
  },

  // FOOTER & BLOCK ALIGNMENTS
  footerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 15,
  },
  footerBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 240, 
  },
  dateTextSpacer: {
    height: 40, 
    display: 'flex',
    justifyContent: 'flex-end',
  },
  dateText: {
    fontSize: 15,
    fontFamily: 'Times-Roman',
    color: '#0F172A',
    marginBottom: 12,
  },
  // 🚀 UPDATED SIGNATURE DIMENSIONS & ALIGNMENT
  signatureImage: {
    width: 290, // Blown up larger
    height: 105, // Proportionally scaled
    objectFit: 'contain',
    marginBottom: -42, // Adjusted to compensate for scale and lock onto the line
    marginLeft: 20, // 🚀 Nudges the signature slightly right for perfect optical centering
    zIndex: 20,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#0F172A',
    marginBottom: 8,
  },
  footerLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  // TRIPLE-RING SECURITY SEAL
  sealContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0B1F42',
    border: '2pt solid #C5A059',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  sealMiddle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    border: '1pt dashed #C5A059',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    border: '1pt solid #C5A059',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealText: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    color: '#C5A059',
    letterSpacing: 2,
  }
});

// Reusable SVG Vector Corner Flourish Component
const CornerFlourish = ({ rotation }: { rotation: string }) => (
  <Svg viewBox="0 0 100 100">
    <G transform={`rotate(${rotation} 50 50)`}>
      <Path d="M 0 0 L 80 0 L 80 8 L 8 8 L 8 80 L 0 80 Z" fill="#C5A059" />
      <Path d="M 18 18 L 50 18 L 50 23 L 23 23 L 23 50 L 18 50 Z" fill="#0B1F42" />
      <Path d="M 30 30 L 38 30 L 38 34 L 34 34 L 34 38 L 30 38 Z" fill="#C5A059" />
    </G>
  </Svg>
);

interface CertificateProps {
  firstName: string;
  lastName: string;
  totalHours: number;
}

export default function CertificatePDF({ firstName, lastName, totalHours }: CertificateProps) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const rawName = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Valued Volunteer';
  const fullName = rawName.replace(/\b\w/g, char => char.toUpperCase());

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.borderOuter}>
          <View style={styles.borderMiddle}>
            <View style={styles.borderInner}>
              
              {/* PURE VECTOR CORNER ACCENTS */}
              <View style={[styles.cornerTag, styles.topLeft]}><CornerFlourish rotation="0" /></View>
              <View style={[styles.cornerTag, styles.topRight]}><CornerFlourish rotation="90" /></View>
              <View style={[styles.cornerTag, styles.bottomLeft]}><CornerFlourish rotation="270" /></View>
              <View style={[styles.cornerTag, styles.bottomRight]}><CornerFlourish rotation="180" /></View>

              {/* TOP: IDENTITY HEADER */}
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Certificate of Service</Text>
                <Text style={styles.subtitle}>Summit Olympiad</Text>
              </View>
              
              {/* MIDDLE: THE OFFICIAL ATTESTATION */}
              <View style={styles.bodyContainer}>
                <Text style={styles.presentedTo}>Is Hereby Proudly Presented To</Text>
                <Text style={styles.name}>{fullName}</Text>
                <View style={styles.nameLine} />
                
                <Text style={styles.bodyText}>
                  For exceptional dedication and the successful verified completion of
                </Text>
                
                <Text style={styles.hoursHighlight}>
                  {totalHours} VERIFIED VOLUNTEER HOURS
                </Text>
                
                <Text style={styles.bodyText}>
                  actively contributing to the development of free, world-class educational curriculum for students everywhere.
                </Text>
              </View>
              
              {/* BOTTOM: TRANSACTIONAL FOOTER */}
              <View style={styles.footerContainer}>
                
                {/* DATE COMPONENT */}
                <View style={styles.footerBox}>
                  <View style={styles.dateTextSpacer}>
                    <Text style={styles.dateText}>{today}</Text>
                  </View>
                  <View style={styles.line} />
                  <Text style={styles.footerLabel}>Date Issued</Text>
                </View>

                {/* STRUCTURAL MEDALLION SEAL */}
                <View style={styles.sealContainer}>
                  <View style={styles.sealMiddle}>
                    <View style={styles.sealInner}>
                      <Text style={styles.sealText}>SUMMIT</Text>
                    </View>
                  </View>
                </View>

                {/* SIGNATURE EXTRACTION */}
                <View style={styles.footerBox}>
                  <Image src="/signature.png" style={styles.signatureImage} />
                  <View style={styles.line} />
                  <Text style={styles.footerLabel}>Founder & CEO, Summit Olympiad</Text>
                </View>

              </View>

            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}