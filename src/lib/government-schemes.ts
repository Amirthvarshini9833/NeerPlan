export type GovernmentScheme = {
  title: string;
  authority: string;
  summary: string;
  eligibility: string;
  officialUrl: string;
  verifiedOn: string;
};

const verifiedOn = "2026-08-20";

const catchTheRain: GovernmentScheme = {
  title: "Jal Shakti Abhiyan: Catch the Rain",
  authority: "Ministry of Jal Shakti, Government of India",
  summary: "A national water-conservation campaign covering rural and urban areas, with rainwater harvesting and groundwater recharge among its focus areas.",
  eligibility: "Check with your municipal body, water board, or Gram Panchayat for local activities and support. This campaign does not itself guarantee household funding.",
  officialUrl: "https://www.jalshakti-dowr.gov.in/static/uploads/2024/07/4e0d30bd040c986e53f31178d9487f65.pdf",
  verifiedOn,
};

const centralRechargeGuidance: GovernmentScheme = {
  title: "Central Ground Water Board recharge guidance",
  authority: "Central Ground Water Board, Government of India",
  summary: "Official guidance on artificial recharge and rainwater-harvesting approaches that can help identify the right local authority or technical route.",
  eligibility: "Use this as a technical and policy reference; confirm local permissions, design requirements, and any financial assistance with the relevant authority.",
  officialUrl: "https://cgwb.gov.in/en/faq-general",
  verifiedOn,
};

const stateSchemes: Record<string, GovernmentScheme[]> = {
  "Tamil Nadu": [{ title: "Tamil Nadu urban rainwater-harvesting programme", authority: "Municipal Administration and Water Supply Department, Government of Tamil Nadu", summary: "Tamil Nadu urban local bodies maintain rainwater-harvesting structures and apply the State's rainwater-conservation requirements.", eligibility: "Ask your local urban body whether your building requires a structure, whether an inspection is available, and whether any local assistance is open.", officialUrl: "https://www.tnurbantree.tn.gov.in/ws/", verifiedOn }],
  Karnataka: [{ title: "Bengaluru rainwater-harvesting requirements", authority: "Government of India reference to Bangalore Water Supply and Sewerage Board rules", summary: "The official reference describes rainwater-harvesting requirements for certain existing and new Bengaluru properties.", eligibility: "The requirement and process depend on property size and the current local water-board or municipal rules; confirm directly before installing.", officialUrl: "https://www.pib.gov.in/newsite/PrintRelease.aspx?lang=2&reg=48&relid=101516", verifiedOn }],
  Kerala: [{ title: "Mazhapolima roof-rainwater and open-well recharge initiative", authority: "Kerala State Disaster Management Authority", summary: "A Kerala initiative that channels filtered rooftop rainwater to open wells or recharge pits to improve groundwater availability.", eligibility: "Availability and support are local. Check with your Gram Panchayat, municipality, or district authority before relying on any subsidy or installation support.", officialUrl: "https://sdma.kerala.gov.in/mazhapolima-2015/", verifiedOn }],
  "Andhra Pradesh": [{ title: "Watershed Development Component of PMKSY", authority: "Department of Land Resources, Government of India", summary: "The official state dashboard tracks water-harvesting structures under watershed-development work in Andhra Pradesh.", eligibility: "Support is project- and location-based. Contact the district watershed or rural-development office to check whether your area or community project is covered.", officialUrl: "https://wdcpmksy.dolr.gov.in/getStateWiseWtrStrDetails", verifiedOn }],
  Telangana: [{ title: "Telangana rainwater-harvesting and recharge guidance", authority: "Government of Telangana / Hyderabad Metropolitan Water Supply and Sewerage Board", summary: "Official guidance covers rooftop storage, recharge pits, trenches, wells, and rainwater-harvesting requirements for larger premises.", eligibility: "Ask your local body or water board about property-specific requirements, technical guidance, and any active local support programme.", officialUrl: "https://www.telangana.gov.in/rain-water-harvesting-2/", verifiedOn }],
  Maharashtra: [{ title: "Jalyukt Shivar Abhiyan", authority: "Government of Maharashtra", summary: "A water-conservation programme that includes groundwater recharge, water-harvesting structures, and village-level water-security works.", eligibility: "This is generally implemented through local and community works. Contact your Gram Panchayat, Zilla Parishad, or water-conservation office for current local participation routes.", officialUrl: "https://zpthane.maharashtra.gov.in/en/scheme/jalyukt-shivar-abhiyan/", verifiedOn }],
};

export function getGovernmentSchemes(state: string) {
  return [catchTheRain, ...(stateSchemes[state] ?? [centralRechargeGuidance])];
}
