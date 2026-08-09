/**
 * Stored oldest-first by start date; the UI reverses this so the Werdegang
 * reads newest-first. `track` splits the list at the career change:
 * everything up to the last purchasing role is `commercial`, everything from
 * the second-chance Abitur onwards is `it`. The UI renders the `it` group
 * first and shows the split visually (solid vs. ghost chips, filled vs.
 * hollow map pins) instead of labelling it.
 */
export type Station = {
	id: string;
	track: 'commercial' | 'it';
	company: string;
	role: string;
	period: string;
	lat: number;
	lng: number;
	summary: string;
	bullets: string[];
};

export type ClientProject = {
	id: string;
	name: string;
	sector: string;
	period: string;
	scale: string;
	summary: string;
	bullets: string[];
};

export type SiteContent = {
	meta: { title: string; description: string };
	nav: { skills: string; projects: string; career: string; project: string; contact: string };
	hero: {
		name: string;
		role: string;
		tagline: string;
		cta: string;
		ctaSecondary: string;
	};
	stats: { value: string; label: string }[];
	skills: {
		title: string;
		groups: { title: string; items: string[] }[];
	};
	projects: {
		title: string;
		intro: string;
		items: ClientProject[];
	};
	career: {
		title: string;
		intro: string;
		stations: Station[];
	};
	project: {
		title: string;
		name: string;
		tagline: string;
		description: string;
		stack: string[];
		link: string;
		cta: string;
		imageAlt: string;
	};
	certifications: {
		title: string;
		items: { name: string; issuer: string; year: string }[];
	};
	contact: {
		title: string;
		email: string;
	};
};

export const de: SiteContent = {
	meta: {
		title: 'Dennis Wiredu - Citrix Plattform & Cloud Engineer',
		description:
			'Infrastruktur-Engineer mit mehreren Jahren Erfahrung im Aufbau und Betrieb von Virtualisierungs- und Cloud-Plattformen.'
	},
	nav: {
		skills: 'Skills',
		projects: 'Aktuelle Projekte',
		career: 'Werdegang',
		project: 'Projekt',
		contact: 'Kontakt'
	},
	hero: {
		name: 'Dennis Wiredu',
		role: 'Citrix Plattform & Cloud Engineer',
		tagline:
			'Ich baue und betreibe Virtualisierungs- und Cloud-Plattformen für bis zu 15.000 Nutzer. Daneben entwickle ich eigene Software, die im echten Einsatz läuft.',
		cta: 'Kontakt aufnehmen',
		ctaSecondary: 'Werdegang ansehen'
	},
	stats: [
		{ value: '3+', label: 'Jahre Infrastruktur-Erfahrung' },
		{ value: '15.000+', label: 'Nutzer auf der größten Plattform' },
		{ value: '3', label: 'Zertifizierungen' }
	],
	skills: {
		title: 'Skills',
		groups: [
			{
				title: 'Cloud & Virtualisierung',
				items: [
					'Microsoft Azure',
					'Azure Virtual Desktop (AVD)',
					'Microsoft 365',
					'Citrix Virtual Apps & Desktops (CVAD)',
					'Citrix NetScaler',
					'Provisioning Services (PVS)',
					'Ivanti'
				]
			},
			{
				title: 'Automatisierung & IaC',
				items: ['PowerShell', 'Terraform', 'Ansible', 'GitHub Actions (CI/CD)']
			},
			{
				title: 'Entwicklung',
				items: [
					'TypeScript',
					'JavaScript',
					'HTML & CSS',
					'SvelteKit',
					'Git',
					'KI-gestützte Entwicklung (Claude Code, Codex, Copilot)'
				]
			},
			{
				title: 'Betrieb & Prozesse',
				items: [
					'Active Directory',
					'Nagios Monitoring',
					'ITSM & Change Management',
					'Technische Dokumentation',
					'SOP-Erstellung'
				]
			}
		]
	},
	projects: {
		title: 'Aktuelle Projekte',
		intro:
			'Ausgewählte Projekte von der Konzeption bis zum laufenden Betrieb, für Umgebungen mit 700 bis über 15.000 Nutzern.',
		items: [
			{
				id: 'automotive',
				name: 'Automobilhersteller München',
				sector: 'Automotive',
				period: '08/2023 - 09/2024',
				scale: '15.000+ Nutzer',
				summary:
					'Automatisierung und Skalierung einer der größten Citrix-Umgebungen im Konzernumfeld.',
				bullets: [
					'Automatisierung wiederkehrender Citrix-Betriebsprozesse via PowerShell',
					'PVS Image Management: Golden-Image-Lifecycle für über 15.000 Nutzer',
					'Planung und Umsetzung eines Major-Upgrades der Citrix-Infrastruktur',
					'Aufbau des Monitorings mit Nagios sowie Pflege der Ivanti-Personalisierungsrichtlinien',
					'2nd & 3rd Level Support, technische Dokumentation und SOPs'
				]
			},
			{
				id: 'greenfield',
				name: 'Kirchliche Einrichtung - Greenfield-Aufbau',
				sector: 'Non-Profit',
				period: '03/2025 - heute',
				scale: 'ca. 700 Nutzer',
				summary: 'Kompletter Neuaufbau einer CVAD-Plattform, von der Architektur bis zum Go-live.',
				bullets: [
					'Vollständiger Neuaufbau einer CVAD-Plattform: Architektur, Dimensionierung, Konfiguration',
					'Design der Betriebs-, Deployment- und Freigabeprozesse',
					'Personalisierungs-Framework via Ivanti, systematisches Testing vor Go-live'
				]
			},
			{
				id: 'operations',
				name: 'Kirchliche Einrichtung - Betrieb',
				sector: 'Non-Profit',
				period: '10/2024 - heute',
				scale: 'ca. 700 Nutzer',
				summary: 'Laufender Betrieb und Standardisierung einer bestehenden CVAD-Plattform.',
				bullets: [
					'Infrastruktur-Upgrades und Störungsbehebung',
					'Verwaltung der Ivanti-Personalisierungsrichtlinien',
					'Ablösung manueller Abläufe durch dokumentierte Standardprozesse'
				]
			},
			{
				id: 'federal',
				name: 'Bundesbehörde',
				sector: 'Öffentlicher Sektor',
				period: '08/2025 - 01/2026',
				scale: 'ca. 7.000 Nutzer',
				summary: 'Upgrades und Störungsbehebung in einer großen Behördenumgebung.',
				bullets: [
					'Planung und Durchführung von Upgrades und Updates der Citrix-Infrastruktur',
					'Root-Cause-Analyse komplexer Störungen (2nd & 3rd Level)',
					'Technische Dokumentation und SOPs zur Standardisierung des Betriebs'
				]
			}
		]
	},
	career: {
		title: 'Werdegang',
		intro:
			'Acht Stationen in München, vom kaufmännischen Einstieg bis zum Citrix Consultant. Für Details auf einen Punkt in der Karte klicken.',
		stations: [
			{
				id: 'hausladen',
				track: 'commercial',
				company: 'Hausladen Fruchthandels GmbH',
				role: 'Ausbildung zum Kaufmann im Groß- und Außenhandel (IHK)',
				period: '09/2011 - 06/2014',
				lat: 48.1195,
				lng: 11.548,
				summary: 'Dreijährige duale Ausbildung im Großhandel mit IHK-Abschluss.',
				bullets: ['Kaufmännische Ausbildung im Groß- und Außenhandel, abgeschlossen mit IHK-Prüfung']
			},
			{
				id: 'notebooksbilliger',
				track: 'commercial',
				company: 'notebooksbilliger.de',
				role: 'Einkäufer',
				period: '12/2014 - 09/2015',
				lat: 48.1268,
				lng: 11.5602,
				summary: 'Einkauf bei einem Online-Händler für Unterhaltungselektronik.',
				bullets: ['Einkauf und Lieferantenkommunikation im Elektronikhandel']
			},
			{
				id: 'businesscoffee',
				track: 'commercial',
				company: 'Business-Coffee GmbH',
				role: 'Einkäufer / Purchase Manager',
				period: '10/2015 - 12/2016',
				lat: 48.1655,
				lng: 11.5395,
				summary: 'Verantwortung für den gesamten Einkauf, die letzte Station vor dem Wechsel in die IT.',
				bullets: ['Einkauf und Betreuung der Lieferanten']
			},
			{
				id: 'bos',
				track: 'it',
				company: 'Berufliche Oberschule (BOS) München',
				role: 'Allgemeine Hochschulreife (Zweiter Bildungsweg)',
				period: '2017 - 2019',
				lat: 48.1301,
				lng: 11.5104,
				summary: 'Abitur auf dem zweiten Bildungsweg, der Anfang des Wechsels in die IT.',
				bullets: ['Allgemeine Hochschulreife über den zweiten Bildungsweg']
			},
			{
				id: 'lmu',
				track: 'it',
				company: 'Ludwig-Maximilians-Universität München',
				role: 'Studium Medieninformatik (5 Semester, ohne Abschluss)',
				period: '10/2020 - 02/2023',
				lat: 48.1508,
				lng: 11.5802,
				summary:
					'Schwerpunkt Mensch-Maschine-Interaktion. Abgebrochen, um in die IT-Beratung einzusteigen.',
				bullets: [
					'Fünf Semester Medieninformatik mit Schwerpunkt Mensch-Maschine-Interaktion',
					'Ohne Abschluss beendet, um in die IT-Beratung einzusteigen'
				]
			},
			{
				id: 'itfactum',
				track: 'it',
				company: 'it factum GmbH',
				role: 'Werkstudent Administration',
				period: '08/2021 - 07/2022',
				lat: 48.142,
				lng: 11.5335,
				summary: 'Betreuung der Netzwerkinfrastruktur und der internen Dienste eines IT-Dienstleisters.',
				bullets: [
					'Pflege interner Services: Microsoft 365, SharePoint, Teams, VoIP, openLDAP, Linux-Webserver',
					'Monitoring der Server- und Serviceinfrastruktur mit Zabbix',
					'Einrichtung neuer Server und Services, teils automatisiert mit Ansible',
					'On- und Offboarding inkl. Hardware-Beschaffung und Account-Verwaltung',
					'IT-Support über internen ServiceDesk (JIRA), Inventarisierung, Verschlüsselungslösung'
				]
			},
			{
				id: 'kurzgesagt',
				track: 'it',
				company: 'Kurzgesagt - In a Nutshell GmbH',
				role: 'Working Student IT',
				period: '08/2022 - 01/2023',
				lat: 48.133,
				lng: 11.5585,
				summary: 'IT-Support beim größten Wissenschaftskanal Europas auf YouTube.',
				bullets: [
					'Technisches On- und Offboarding neuer Mitarbeitender',
					'Interner IT-Support und administrative Unterstützung bei VR-Themen',
					'Koordination von Hardware-Bestellungen',
					'Schnittstelle zum externen IT-Dienstleister',
					'Administration der Office-365-Lösungen'
				]
			},
			{
				id: 'provectus',
				track: 'it',
				company: 'Provectus GmbH',
				role: 'Citrix Engineer → Citrix Consultant',
				period: '02/2023 - heute',
				lat: 48.173,
				lng: 11.587,
				summary:
					'Vom Trainee zum Consultant im Bereich Virtualisierung: Aufbau, Betrieb und Automatisierung von Citrix-Plattformen mit 700 bis 15.000+ Nutzern.',
				bullets: [
					'02/2023 - 07/2023: Traineeprogramm - Virtualisierung, Active Directory, Netzwerke, Citrix NetScaler, CVAD, Azure- & M365-Grundlagen',
					'Seit 08/2023: Citrix Consultant mit Fokus auf Aufbau, Betrieb und Automatisierung großer Virtualisierungsplattformen'
				]
			}
		]
	},
	project: {
		title: 'Eigenes Projekt',
		name: 'Tabiyume',
		tagline: 'App zur Reiseplanung',
		description:
			'Allein umgesetzt, von der Idee bis zum Deployment. Funktioniert offline, gleicht sich mit der Cloud ab und erlaubt gemeinsames Planen in Echtzeit auf einer interaktiven Karte.',
		stack: [
			'SvelteKit 5',
			'TypeScript (strict)',
			'Tailwind CSS 4',
			'Firebase Realtime Database',
			'MapLibre GL',
			'Azure Static Web Apps',
			'GitHub Actions CI/CD'
		],
		link: 'https://www.tabiyume.de',
		cta: 'Projekt ansehen',
		imageAlt: 'Tabiyume Reiseplanung mit Japan-Karte, Reiseroute und Tagesplanung'
	},
	certifications: {
		title: 'Zertifizierungen',
		items: [
			{ name: 'Azure Virtual Desktop Specialty', issuer: 'Microsoft · AZ-140', year: '2024' },
			{
				name: 'Security, Compliance and Identity Fundamentals',
				issuer: 'Microsoft · SC-900',
				year: '2025'
			},
			{ name: 'Cybersecurity Certificate', issuer: 'Google', year: '2024' }
		]
	},
	contact: {
		title: 'Kontakt',
		email: 'dennis@wiredu.cloud'
	}
};

export const en: SiteContent = {
	meta: {
		title: 'Dennis Wiredu - Citrix Platform & Cloud Engineer',
		description:
			'Infrastructure engineer with several years of experience building and running virtualization and cloud platforms.'
	},
	nav: {
		skills: 'Skills',
		projects: 'Latest Projects',
		career: 'Career',
		project: 'Project',
		contact: 'Contact'
	},
	hero: {
		name: 'Dennis Wiredu',
		role: 'Citrix Platform & Cloud Engineer',
		tagline:
			'I build and run virtualization and cloud platforms for up to 15,000 users, and ship software on the side.',
		cta: 'Get in touch',
		ctaSecondary: 'See career'
	},
	stats: [
		{ value: '3+', label: 'years of infrastructure experience' },
		{ value: '15,000+', label: 'users on the largest platform' },
		{ value: '3', label: 'certifications' }
	],
	skills: {
		title: 'Skills',
		groups: [
			{
				title: 'Cloud & Virtualization',
				items: [
					'Microsoft Azure',
					'Azure Virtual Desktop (AVD)',
					'Microsoft 365',
					'Citrix Virtual Apps & Desktops (CVAD)',
					'Citrix NetScaler',
					'Provisioning Services (PVS)',
					'Ivanti'
				]
			},
			{
				title: 'Automation & IaC',
				items: ['PowerShell', 'Terraform', 'Ansible', 'GitHub Actions (CI/CD)']
			},
			{
				title: 'Development',
				items: [
					'TypeScript',
					'JavaScript',
					'HTML & CSS',
					'SvelteKit',
					'Git',
					'AI-assisted development (Claude Code, Codex, Copilot)'
				]
			},
			{
				title: 'Operations & Process',
				items: [
					'Active Directory',
					'Nagios Monitoring',
					'ITSM & Change Management',
					'Technical Documentation',
					'SOP Authoring'
				]
			}
		]
	},
	projects: {
		title: 'Latest Projects',
		intro:
			'Selected projects, from first concept through to day-to-day operations, for environments of 700 to over 15,000 users.',
		items: [
			{
				id: 'automotive',
				name: 'Munich automotive manufacturer',
				sector: 'Automotive',
				period: '08/2023 - 09/2024',
				scale: '15,000+ users',
				summary: 'Automated and scaled one of the largest Citrix environments in the group.',
				bullets: [
					'Automated recurring Citrix operations processes via PowerShell',
					'PVS image management: golden-image lifecycle for 15,000+ users',
					'Planned and executed a major upgrade of the Citrix infrastructure',
					'Built monitoring with Nagios and maintained the Ivanti personalization policies',
					'2nd & 3rd level support, technical documentation and SOPs'
				]
			},
			{
				id: 'greenfield',
				name: 'Religious institution - greenfield build',
				sector: 'Non-profit',
				period: '03/2025 - present',
				scale: '~700 users',
				summary: 'Full rebuild of a CVAD platform, from architecture to go-live.',
				bullets: [
					'Full rebuild of a CVAD platform: architecture, sizing, configuration',
					'Designed operations, deployment, and release processes',
					'Personalization framework via Ivanti, systematic testing before go-live'
				]
			},
			{
				id: 'operations',
				name: 'Religious institution - operations',
				sector: 'Non-profit',
				period: '10/2024 - present',
				scale: '~700 users',
				summary: 'Ongoing operations and standardization of an existing CVAD platform.',
				bullets: [
					'Infrastructure upgrades and incident resolution',
					'Managed Ivanti personalization policies',
					'Replaced manual workflows with documented standard processes'
				]
			},
			{
				id: 'federal',
				name: 'Federal agency',
				sector: 'Public sector',
				period: '08/2025 - 01/2026',
				scale: '~7,000 users',
				summary: 'Upgrades and incident resolution in a large government environment.',
				bullets: [
					'Planned and executed upgrades and updates of the Citrix infrastructure',
					'Root-cause analysis of complex incidents (2nd & 3rd level)',
					'Technical documentation and SOPs to standardize operations'
				]
			}
		]
	},
	career: {
		title: 'Career',
		intro:
			'Eight stops in Munich, from a commercial apprenticeship to Citrix consultant. Click a pin on the map for details.',
		stations: [
			{
				id: 'hausladen',
				track: 'commercial',
				company: 'Hausladen Fruchthandels GmbH',
				role: 'Apprenticeship in wholesale and foreign trade (IHK)',
				period: '09/2011 - 06/2014',
				lat: 48.1195,
				lng: 11.548,
				summary: 'Three-year dual apprenticeship in wholesale, completed with the IHK exam.',
				bullets: ['Commercial apprenticeship in wholesale and foreign trade, IHK certified']
			},
			{
				id: 'notebooksbilliger',
				track: 'commercial',
				company: 'notebooksbilliger.de',
				role: 'Purchaser',
				period: '12/2014 - 09/2015',
				lat: 48.1268,
				lng: 11.5602,
				summary: 'Purchasing for an online consumer electronics retailer, from sourcing to supplier contact.',
				bullets: ['Purchasing and supplier communication in electronics retail']
			},
			{
				id: 'businesscoffee',
				track: 'commercial',
				company: 'Business-Coffee GmbH',
				role: 'Purchaser / Purchase Manager',
				period: '10/2015 - 12/2016',
				lat: 48.1655,
				lng: 11.5395,
				summary: 'Ran purchasing end to end, the last role before moving into IT.',
				bullets: ['Purchasing and supplier relationships']
			},
			{
				id: 'bos',
				track: 'it',
				company: 'Berufliche Oberschule (BOS) Munich',
				role: 'General higher education entrance qualification (second-chance route)',
				period: '2017 - 2019',
				lat: 48.1301,
				lng: 11.5104,
				summary:
					'Evening school route to a university entrance qualification, where the move into IT began.',
				bullets: ['General higher education entrance qualification via the second-chance route']
			},
			{
				id: 'lmu',
				track: 'it',
				company: 'Ludwig Maximilian University of Munich',
				role: 'Media informatics studies (5 semesters, unfinished)',
				period: '10/2020 - 02/2023',
				lat: 48.1508,
				lng: 11.5802,
				summary:
					'Focused on human-computer interaction. Left before finishing to start in IT consulting.',
				bullets: [
					'Five semesters of media informatics with a focus on human-computer interaction',
					'Left before finishing to start in IT consulting'
				]
			},
			{
				id: 'itfactum',
				track: 'it',
				company: 'it factum GmbH',
				role: 'Working Student, Administration',
				period: '08/2021 - 07/2022',
				lat: 48.142,
				lng: 11.5335,
				summary: 'Maintained network infrastructure and internal services for an IT solutions provider.',
				bullets: [
					'Maintained internal services: Microsoft 365, SharePoint, Teams, VoIP, openLDAP, Linux web servers',
					'Monitored server and service infrastructure with Zabbix',
					'Set up new servers and services, partly automated with Ansible',
					'On- and offboarding including hardware provisioning and account management',
					'IT support via internal service desk (JIRA), inventory management, encryption solution'
				]
			},
			{
				id: 'kurzgesagt',
				track: 'it',
				company: 'Kurzgesagt - In a Nutshell GmbH',
				role: 'Working Student IT',
				period: '08/2022 - 01/2023',
				lat: 48.133,
				lng: 11.5585,
				summary: "IT support at Europe's biggest science channel on YouTube.",
				bullets: [
					'Technical on- and offboarding of new employees',
					'Internal IT support and administrative support for VR projects',
					'Coordination of hardware orders',
					'Interface to the external IT service provider',
					'Administration of Office 365 solutions'
				]
			},
			{
				id: 'provectus',
				track: 'it',
				company: 'Provectus GmbH',
				role: 'Citrix Engineer → Citrix Consultant',
				period: '02/2023 - present',
				lat: 48.173,
				lng: 11.587,
				summary:
					'From trainee to consultant in virtualization: building, running, and automating Citrix platforms serving 700 to 15,000+ users.',
				bullets: [
					'02/2023 - 07/2023: Trainee program - virtualization, Active Directory, networking, Citrix NetScaler, CVAD, Azure & M365 fundamentals',
					'Since 08/2023: Citrix Consultant focused on building, operating, and automating large virtualization platforms'
				]
			}
		]
	},
	project: {
		title: 'Side project',
		name: 'Tabiyume',
		tagline: 'Trip-planning app',
		description:
			'Built entirely on my own, from the first idea to deployment. It works offline, syncs to the cloud, and lets people plan together in real time on an interactive map.',
		stack: [
			'SvelteKit 5',
			'TypeScript (strict)',
			'Tailwind CSS 4',
			'Firebase Realtime Database',
			'MapLibre GL',
			'Azure Static Web Apps',
			'GitHub Actions CI/CD'
		],
		link: 'https://www.tabiyume.de',
		cta: 'View project',
		imageAlt: 'Tabiyume trip planner showing a map of Japan, itinerary and daily schedule'
	},
	certifications: {
		title: 'Certifications',
		items: [
			{ name: 'Azure Virtual Desktop Specialty', issuer: 'Microsoft · AZ-140', year: '2024' },
			{
				name: 'Security, Compliance and Identity Fundamentals',
				issuer: 'Microsoft · SC-900',
				year: '2025'
			},
			{ name: 'Cybersecurity Certificate', issuer: 'Google', year: '2024' }
		]
	},
	contact: {
		title: 'Contact',
		email: 'dennis@wiredu.cloud'
	}
};

export function contentFor(lang: 'de' | 'en'): SiteContent {
	return lang === 'de' ? de : en;
}
