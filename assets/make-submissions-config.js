// MAKE submissions setup — this is the only file that needs course-specific URLs.
window.MAKE_SUBMISSIONS_CONFIG = {
  // Paste the published Google Sheet CSV URL here. Leave blank until it is ready.
  GOOGLE_MAKE_SHEET_URL: '',

  assignments: {
    make01: { title: 'ATLAS 01 — Engineering Nation', formUrl: '' },
    make02: { title: 'Local Spatial Problem', formUrl: '' },
    make03: { title: 'Fix My Community', formUrl: '' },
    make04: { title: 'Redesign It', formUrl: '' },
    make05: { title: 'My Doraemon', formUrl: '' },
    make06: { title: 'AI Impact Card', formUrl: '' },
    make07: { title: 'Infrastructure Decision Map', formUrl: '' },
    make08: { title: 'Appropriate Intervention', formUrl: '' },
    make09: { title: 'Field-Test Revision', formUrl: '' },
    make10: { title: 'First 72 Hours', formUrl: '' },
    make11: { title: 'Japan → World', formUrl: '' },
    make12: { title: 'Installation', formUrl: '' }
  },

  // Local-development fallback only. It is used on localhost when the Sheet is
  // unavailable, and is kept here so it can be removed without touching site code.
  localSampleSubmissions: [
    {
      Timestamp: '2026-09-30T09:30:00+09:00',
      Assignment: 'ATLAS 01 — Engineering Nation',
      'Student ID': 'sample-001',
      'Display Name': 'Sample Student',
      'Project Title': 'A map of a changing nation',
      Description: 'A local development sample for the first Atlas contribution.',
      'Project URL': 'https://example.com',
      'Thumbnail URL': '',
      'UNIPA Confirmation': 'Yes'
    }
  ]
};
