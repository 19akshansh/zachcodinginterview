import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 12 },
  header: { marginBottom: 20, borderBottom: 1, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#374151' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scoreBox: { padding: 10, backgroundColor: '#f3f4f6', borderRadius: 4 },
  verdict: { marginTop: 20, padding: 15, borderRadius: 8, color: '#fff', textAlign: 'center' },
  suggestion: { marginBottom: 5, paddingLeft: 10 }
});

export const InterviewReportPDF = ({ report, candidateName, questionTitle }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Interview Feedback Report</Text>
        <Text>Candidate: {candidateName}</Text>
        <Text>Topic: {questionTitle}</Text>
        <Text>Date: {new Date(report.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.scoreBox}>
        <Text style={{ fontSize: 18, textAlign: 'center' }}>Overall Score: {report.overallScore}/100</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Breakdown</Text>
        <View style={styles.row}><Text>Problem Solving</Text><Text>{report.problemSolving}/10</Text></View>
        <View style={styles.row}><Text>Code Quality</Text><Text>{report.codeQuality}/10</Text></View>
        <View style={styles.row}><Text>Communication</Text><Text>{report.communication}/10</Text></View>
        <View style={styles.row}><Text>Optimization</Text><Text>{report.optimization}/10</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verdict: {report.verdict}</Text>
        <Text style={{ color: '#6b7280' }}>Complexity Analysis: {report.timeComplexity}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Suggestions</Text>
        {report.suggestions.map((s: string, i: number) => (
          <Text key={i} style={styles.suggestion}>• {s}</Text>
        ))}
      </View>
    </Page>
  </Document>
);