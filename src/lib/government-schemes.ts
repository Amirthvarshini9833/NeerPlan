export type GovernmentScheme = {
  title: string;
  authority: string;
  summary: string;
  benefit: string;
  eligibility: string;
  applicationRoute: string;
  officialUrl: string;
  verifiedOn: string;
};

const verifiedOn = "2026-08-20";

const catchTheRain: GovernmentScheme = {
  title: "Jal Shakti Abhiyan: Catch the Rain",
  authority: "Ministry of Jal Shakti, Government of India",
  summary: "A national water-conservation campaign covering rural and urban areas, with rainwater harvesting and groundwater recharge among its focus areas.",
  benefit: "Government support: the campaign helps local bodies prioritise rainwater-harvesting and recharge work. The official campaign material reviewed does not publish a nationwide household cash subsidy.",
  eligibility: "Households, communities, local bodies, and institutions may take part through locally organised activities; the exact route varies by district.",
  applicationRoute: "Ask your municipal body, water board, or Gram Panchayat whether a current Catch the Rain activity, technical assistance, or community work is open in your area.",
  officialUrl: "https://www.jalshakti-dowr.gov.in/static/uploads/2024/07/4e0d30bd040c986e53f31178d9487f65.pdf",
  verifiedOn,
};

const centralRechargeGuidance: GovernmentScheme = {
  title: "Central Ground Water Board recharge guidance",
  authority: "Central Ground Water Board, Government of India",
  summary: "Official guidance on artificial recharge and rainwater-harvesting approaches that can help identify the right local authority or technical route.",
  benefit: "Government support: an official technical and policy reference for planning a safe recharge approach. It is not a household grant programme.",
  eligibility: "Anyone planning recharge can use the guidance, subject to local permissions and site conditions.",
  applicationRoute: "Use the guidance when speaking with the local water, groundwater, municipal, or Panchayat authority about technical requirements and current assistance.",
  officialUrl: "https://cgwb.gov.in/en/faq-general",
  verifiedOn,
};

const stateSchemes: Record<string, GovernmentScheme[]> = {
  "Tamil Nadu": [{ title: "Tamil Nadu urban rainwater-harvesting programme", authority: "Municipal Administration and Water Supply Department, Government of Tamil Nadu", summary: "Tamil Nadu urban local bodies maintain rainwater-harvesting structures and apply the State's rainwater-conservation requirements.", benefit: "Government support: urban local-body action plans include revival, rehabilitation, and maintenance of rainwater-harvesting structures. The official page reviewed does not publish a statewide household cash subsidy.", eligibility: "Urban property owners should check whether their building must have a structure and whether local assistance or inspection is currently available.", applicationRoute: "Contact your municipality, corporation, or town panchayat water / engineering section with your property details and this report.", officialUrl: "https://www.tnurbantree.tn.gov.in/ws/", verifiedOn }],
  Karnataka: [{ title: "Bengaluru rainwater-harvesting requirements", authority: "Government of India reference to Bangalore Water Supply and Sewerage Board rules", summary: "The official reference describes rainwater-harvesting requirements for certain existing and new Bengaluru properties.", benefit: "Government support: official compliance guidance for eligible Bengaluru properties. No current household cash subsidy or rebate is stated in the reviewed source.", eligibility: "Whether the rules apply depends on the property size, construction status, and current water-board or municipal rules.", applicationRoute: "Confirm the current requirement with the water board or local municipal office before finalising the design.", officialUrl: "https://www.pib.gov.in/newsite/PrintRelease.aspx?lang=2&reg=48&relid=101516", verifiedOn }],
  Kerala: [{ title: "Mazhapolima roof-rainwater and open-well recharge initiative", authority: "Kerala State Disaster Management Authority", summary: "A Kerala initiative that channels filtered rooftop rainwater to open wells or recharge pits to improve groundwater availability.", benefit: "Government support: the initiative has received government project funding for well-recharge units. The reviewed official page does not publish a current standard household subsidy amount or application window.", eligibility: "Availability is local and may depend on the district, Panchayat, an open-well / recharge opportunity, and any active local programme.", applicationRoute: "Ask your Gram Panchayat, municipality, district authority, or water-resources office whether Mazhapolima-style support is currently operating locally.", officialUrl: "https://sdma.kerala.gov.in/mazhapolima-2015/", verifiedOn }],
  "Andhra Pradesh": [{ title: "Watershed Development Component of PMKSY", authority: "Department of Land Resources, Government of India", summary: "The official state dashboard tracks water-harvesting structures under watershed-development work in Andhra Pradesh.", benefit: "Government support: water-harvesting works can be delivered through approved watershed and community projects. The dashboard does not state a standard individual household payment.", eligibility: "Eligibility is project- and location-based, often through a covered watershed, village, or community work.", applicationRoute: "Contact the district watershed or rural-development office to check whether your village or site is within an active project.", officialUrl: "https://wdcpmksy.dolr.gov.in/getStateWiseWtrStrDetails", verifiedOn }],
  Telangana: [{ title: "Telangana rainwater-harvesting and recharge guidance", authority: "Government of Telangana / Hyderabad Metropolitan Water Supply and Sewerage Board", summary: "Official guidance covers rooftop storage, recharge pits, trenches, wells, and rainwater-harvesting requirements for larger premises.", benefit: "Government support: official design and compliance guidance that can help protect groundwater. The reviewed official page does not state a household cash subsidy.", eligibility: "The cited requirement applies to premises over the stated plot-size threshold; local rules and site conditions still need confirmation.", applicationRoute: "Ask the local body or water board about the property-specific requirement, technical guidance, and any active local support programme.", officialUrl: "https://www.telangana.gov.in/rain-water-harvesting-2/", verifiedOn }],
  Maharashtra: [{ title: "Jalyukt Shivar Abhiyan", authority: "Government of Maharashtra", summary: "A water-conservation programme that includes groundwater recharge, water-harvesting structures, and village-level water-security works.", benefit: "Government support: village-level water conservation, recharge, and water-security works. The reviewed official page does not publish an individual household subsidy amount.", eligibility: "Support is generally delivered through local and community works; eligibility depends on the local plan and implementing authority.", applicationRoute: "Contact your Gram Panchayat, Zilla Parishad, or water-conservation office to check current local participation routes.", officialUrl: "https://zpthane.maharashtra.gov.in/en/scheme/jalyukt-shivar-abhiyan/", verifiedOn }],
};

export function getGovernmentSchemes(state: string) {
  return [catchTheRain, ...(stateSchemes[state] ?? [centralRechargeGuidance])];
}
