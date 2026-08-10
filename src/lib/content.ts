/**
 * The site is written for one reader: someone deciding whether to invite
 * Dennis to an interview. That shapes the model.
 *
 * `platforms` leads and is ordered by scale, not by date, because "how big
 * were the environments you ran" is the first question a hiring manager has.
 * Each platform carries both a card summary for the overview and the long
 * form for its own page under /projekte/<slug>.
 *
 * `stations` stays oldest-first by start date; the career axis reverses it.
 * `track` splits the list at the career change: everything up to the last
 * purchasing role is `commercial`, everything from the second-chance Abitur
 * onwards is `it`. The axis shows that split visually rather than labelling it.
 */
export type Station = {
	id: string;
	track: 'commercial' | 'it';
	company: string;
	role: string;
	period: string;
	/** Short form for the axis marker, e.g. "2011". */
	year: string;
	summary: string;
	bullets: string[];
};

export type Platform = {
	/** URL segment under /projekte/. Stable, do not rename casually. */
	slug: string;
	name: string;
	sector: string;
	period: string;
	/** Split from the label so the figure can be set in mono on its own. */
	scaleValue: string;
	scaleLabel: string;
	summary: string;
	context: string;
	task: string;
	work: string[];
	outcome: string;
	stack: string[];
};

export type ApproachItem = {
	title: string;
	body: string;
	/**
	 * Concrete tooling per principle. Recruiters and applicant tracking still
	 * scan for product names, so the keywords stay on the page; hanging them
	 * off a principle beats a decontextualised skill dump.
	 */
	tools: string[];
};

export type SiteContent = {
	meta: { title: string; description: string };
	nav: {
		platforms: string;
		approach: string;
		career: string;
		project: string;
		contact: string;
	};
	hero: {
		name: string;
		role: string;
		positioning: string;
		ctaContact: string;
		ctaCv: string;
	};
	cv: { href: string; note: string };
	platforms: { title: string; intro: string; items: Platform[] };
	approach: { title: string; intro: string; items: ApproachItem[] };
	career: {
		title: string;
		intro: string;
		/** Sits at the end of the axis, where the arc resolves. */
		closing: string;
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
	credentials: { title: string; items: { name: string; issuer: string; year: string }[] };
	contact: { title: string; intro: string; email: string };
	caseStudy: {
		back: string;
		context: string;
		task: string;
		work: string;
		outcome: string;
		stack: string;
		scale: string;
		period: string;
		sector: string;
	};
};

const CV_HREF = '/docs/Lebenslauf_Dennis_Wiredu.pdf';
const TABIYUME_STACK = [
	'SvelteKit 5',
	'TypeScript (strict)',
	'Tailwind CSS 4',
	'Firebase Realtime Database',
	'MapLibre GL',
	'Azure Static Web Apps',
	'GitHub Actions CI/CD'
];

export const de: SiteContent = {
	meta: {
		title: 'Dennis Wiredu - Citrix Plattform & Cloud Engineer',
		description:
			'Infrastruktur-Engineer aus München. Aufbau und Betrieb von Virtualisierungs- und Cloud-Plattformen für 700 bis über 15.000 Nutzer.'
	},
	nav: {
		platforms: 'Plattformen',
		approach: 'Arbeitsweise',
		career: 'Werdegang',
		project: 'Projekt',
		contact: 'Kontakt'
	},
	hero: {
		name: 'Dennis Wiredu',
		role: 'Citrix Plattform & Cloud Engineer',
		positioning:
			'Ich baue und betreibe Virtualisierungs- und Cloud-Plattformen für 700 bis über 15.000 Nutzer.',
		ctaContact: 'Kontakt aufnehmen',
		ctaCv: 'Lebenslauf (PDF)'
	},
	cv: { href: CV_HREF, note: 'Vollständiger Lebenslauf als PDF' },
	platforms: {
		title: 'Plattformen',
		intro:
			'Vier Umgebungen, von der Architektur bis zum Regelbetrieb. Sortiert nach Größe, nicht nach Datum.',
		items: [
			{
				slug: 'automotive-muenchen',
				name: 'Automobilhersteller München',
				sector: 'Automotive',
				period: '08/2023 - 09/2024',
				scaleValue: '15.000+',
				scaleLabel: 'Nutzer',
				summary:
					'Automatisierung und Skalierung einer der größten Citrix-Umgebungen im Konzernumfeld.',
				context:
					'Ein Automobilhersteller in München stellt die Arbeitsplätze eines Großteils seiner Belegschaft über Citrix bereit. Die Umgebung ist über Jahre gewachsen und gehört mit über 15.000 Nutzern zu den größten im Konzernumfeld.',
				task: 'Den laufenden Betrieb automatisieren, das Golden-Image-Management für diese Größenordnung beherrschbar halten und die Infrastruktur auf einen aktuellen Stand heben.',
				work: [
					'Wiederkehrende Citrix-Betriebsprozesse in PowerShell automatisiert, statt sie weiter manuell auszuführen',
					'PVS Image Management verantwortet: den kompletten Golden-Image-Lifecycle für über 15.000 Nutzer',
					'Ein Major-Upgrade der Citrix-Infrastruktur geplant und durchgeführt',
					'Das Monitoring mit Nagios aufgebaut und die Ivanti-Personalisierungsrichtlinien gepflegt',
					'2nd und 3rd Level Support geleistet und den Betrieb in technischer Dokumentation und SOPs festgehalten'
				],
				outcome:
					'Wiederkehrende Betriebsaufgaben laufen skriptgesteuert statt per Hand, das Major-Upgrade ist umgesetzt, und der Betrieb ist über SOPs und Dokumentation übergabefähig.',
				stack: [
					'Citrix Virtual Apps & Desktops',
					'Citrix Provisioning Services',
					'PowerShell',
					'Nagios',
					'Ivanti',
					'Active Directory'
				]
			},
			{
				slug: 'bundesbehoerde',
				name: 'Bundesbehörde',
				sector: 'Öffentlicher Sektor',
				period: '08/2025 - 01/2026',
				scaleValue: 'ca. 7.000',
				scaleLabel: 'Nutzer',
				summary: 'Upgrades und Störungsbehebung in einer großen Behördenumgebung.',
				context:
					'Eine Bundesbehörde betreibt ihre Arbeitsplätze über eine Citrix-Umgebung für rund 7.000 Nutzer. Behördenumgebungen sind änderungsarm und stark reglementiert, jede Anpassung will belegt sein.',
				task: 'Die Infrastruktur auf einen gepflegten Stand bringen und komplexe Störungen bis zur Ursache verfolgen, statt sie nur zu umgehen.',
				work: [
					'Upgrades und Updates der Citrix-Infrastruktur geplant und durchgeführt',
					'Root-Cause-Analyse komplexer Störungen im 2nd und 3rd Level',
					'Technische Dokumentation und SOPs erstellt, um den Betrieb zu standardisieren'
				],
				outcome:
					'Die Umgebung ist auf einem gepflegten Versionsstand, wiederkehrende Störungsbilder sind auf ihre Ursache zurückgeführt und der Betrieb ist dokumentiert.',
				stack: [
					'Citrix Virtual Apps & Desktops',
					'Citrix NetScaler',
					'Active Directory',
					'ITSM & Change Management'
				]
			},
			{
				slug: 'greenfield-cvad',
				name: 'Kirchliche Einrichtung, Greenfield-Aufbau',
				sector: 'Non-Profit',
				period: '03/2025 - heute',
				scaleValue: 'ca. 700',
				scaleLabel: 'Nutzer',
				summary: 'Kompletter Neuaufbau einer CVAD-Plattform, von der Architektur bis zum Go-live.',
				context:
					'Eine kirchliche Einrichtung mit rund 700 Nutzern braucht eine neue Plattform für die Bereitstellung ihrer Arbeitsplätze. Kein Bestand, auf dem sich aufbauen ließe: ein Greenfield.',
				task: 'Die Plattform von der Architektur bis zum Go-live verantworten, und dabei den späteren Betrieb von Anfang an mitentwerfen statt ihn nachzureichen.',
				work: [
					'Architektur, Dimensionierung und Konfiguration der CVAD-Plattform vollständig neu aufgesetzt',
					'Die Betriebs-, Deployment- und Freigabeprozesse entworfen, bevor die Plattform in Betrieb ging',
					'Ein Personalisierungs-Framework über Ivanti aufgebaut',
					'Systematisch getestet, bevor der erste Nutzer auf die Plattform kam'
				],
				outcome:
					'Eine neu aufgebaute Plattform, die mit ihren Betriebsprozessen zusammen entstanden ist, statt sie später um sie herum zu bauen.',
				stack: [
					'Citrix Virtual Apps & Desktops',
					'Citrix NetScaler',
					'Ivanti',
					'Active Directory',
					'PowerShell'
				]
			},
			{
				slug: 'cvad-betrieb',
				name: 'Kirchliche Einrichtung, Betrieb',
				sector: 'Non-Profit',
				period: '10/2024 - heute',
				scaleValue: 'ca. 700',
				scaleLabel: 'Nutzer',
				summary: 'Laufender Betrieb und Standardisierung einer bestehenden CVAD-Plattform.',
				context:
					'Dieselbe Einrichtung betreibt parallel eine bestehende CVAD-Plattform. Vieles lief hier über eingespielte, aber nirgends festgehaltene Handgriffe.',
				task: 'Den laufenden Betrieb sicherstellen und die manuellen Abläufe durch nachvollziehbare Standardprozesse ersetzen.',
				work: [
					'Infrastruktur-Upgrades durchgeführt und Störungen behoben',
					'Die Ivanti-Personalisierungsrichtlinien verwaltet',
					'Manuelle Abläufe durch dokumentierte Standardprozesse abgelöst'
				],
				outcome:
					'Der Betrieb hängt nicht mehr an einzelnen Personen, sondern an dokumentierten Prozessen.',
				stack: ['Citrix Virtual Apps & Desktops', 'Ivanti', 'Active Directory', 'PowerShell']
			}
		]
	},
	approach: {
		title: 'Arbeitsweise',
		intro: 'Drei Dinge, die ich in jeder Umgebung gleich handhabe.',
		items: [
			{
				title: 'Automatisieren, was sich wiederholt',
				body: 'Wiederkehrende Betriebsaufgaben gehören in ein Skript, nicht in eine Klickanleitung. Das kostet einmal Zeit und nimmt danach dauerhaft Fehlerquellen aus dem Betrieb.',
				tools: ['PowerShell', 'Terraform', 'Ansible', 'GitHub Actions (CI/CD)']
			},
			{
				title: 'Den Betrieb vor dem Go-live entwerfen',
				body: 'Eine Plattform ist nicht fertig, wenn sie läuft, sondern wenn klar ist, wie sie im Alltag betrieben, aktualisiert und freigegeben wird. Diese Prozesse entstehen bei mir zusammen mit der Architektur.',
				tools: [
					'Citrix Virtual Apps & Desktops',
					'Citrix NetScaler',
					'Provisioning Services',
					'Azure Virtual Desktop',
					'Microsoft Azure & 365',
					'Ivanti'
				]
			},
			{
				title: 'So übergeben, dass es ohne mich weitergeht',
				body: 'Was nur in meinem Kopf existiert, ist ein Risiko für den Kunden. Dokumentation und SOPs sind für mich Teil der Lieferung, nicht die Aufgabe danach.',
				tools: [
					'Technische Dokumentation',
					'SOP-Erstellung',
					'ITSM & Change Management',
					'Nagios Monitoring',
					'Active Directory'
				]
			}
		]
	},
	career: {
		title: 'Der Weg hierher',
		intro:
			'Ich bin nicht auf dem geraden Weg in die IT gekommen. Ich habe im Großhandel eingekauft, das Abitur auf dem zweiten Bildungsweg nachgeholt und mich über Werkstudentenstellen in die Infrastruktur gearbeitet.',
		closing:
			'Von der ersten Werkstudentenstelle bis zur Verantwortung für Plattformen mit 15.000 Nutzern sind es sieben Jahre. Was dabei geblieben ist: Ich lerne Systeme, indem ich sie betreibe.',
		stations: [
			{
				id: 'hausladen',
				track: 'commercial',
				company: 'Hausladen Fruchthandels GmbH',
				role: 'Ausbildung zum Kaufmann im Groß- und Außenhandel (IHK)',
				period: '09/2011 - 06/2014',
				year: '2011',
				summary: 'Dreijährige duale Ausbildung im Großhandel mit IHK-Abschluss.',
				bullets: ['Kaufmännische Ausbildung im Groß- und Außenhandel, abgeschlossen mit IHK-Prüfung']
			},
			{
				id: 'notebooksbilliger',
				track: 'commercial',
				company: 'notebooksbilliger.de',
				role: 'Einkäufer',
				period: '12/2014 - 09/2015',
				year: '2014',
				summary: 'Einkauf bei einem Online-Händler für Unterhaltungselektronik.',
				bullets: ['Einkauf und Lieferantenkommunikation im Elektronikhandel']
			},
			{
				id: 'businesscoffee',
				track: 'commercial',
				company: 'Business-Coffee GmbH',
				role: 'Einkäufer / Purchase Manager',
				period: '10/2015 - 12/2016',
				year: '2015',
				summary:
					'Verantwortung für den gesamten Einkauf, die letzte Station vor dem Wechsel in die IT.',
				bullets: ['Einkauf und Betreuung der Lieferanten']
			},
			{
				id: 'bos',
				track: 'it',
				company: 'Berufliche Oberschule (BOS) München',
				role: 'Allgemeine Hochschulreife (Zweiter Bildungsweg)',
				period: '2017 - 2019',
				year: '2017',
				summary: 'Abitur auf dem zweiten Bildungsweg, der Anfang des Wechsels in die IT.',
				bullets: ['Allgemeine Hochschulreife über den zweiten Bildungsweg']
			},
			{
				id: 'lmu',
				track: 'it',
				company: 'Ludwig-Maximilians-Universität München',
				role: 'Studium Medieninformatik (5 Semester, ohne Abschluss)',
				period: '10/2020 - 02/2023',
				year: '2020',
				summary:
					'Schwerpunkt Mensch-Maschine-Interaktion. Abgebrochen, als die Arbeit in der IT-Beratung mehr Substanz bot als das Studium.',
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
				year: '2021',
				summary:
					'Betreuung der Netzwerkinfrastruktur und der internen Dienste eines IT-Dienstleisters.',
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
				year: '2022',
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
				role: 'Vom Citrix Engineer zum Citrix Consultant',
				period: '02/2023 - heute',
				year: '2023',
				summary:
					'Vom Trainee zum Consultant im Bereich Virtualisierung: Aufbau, Betrieb und Automatisierung von Citrix-Plattformen mit 700 bis 15.000+ Nutzern.',
				bullets: [
					'02/2023 - 07/2023: Traineeprogramm mit Virtualisierung, Active Directory, Netzwerken, Citrix NetScaler, CVAD sowie Azure- und M365-Grundlagen',
					'Seit 08/2023: Citrix Consultant mit Fokus auf Aufbau, Betrieb und Automatisierung großer Virtualisierungsplattformen'
				]
			}
		]
	},
	project: {
		title: 'Neben der Plattformarbeit',
		name: 'Tabiyume',
		tagline: 'App zur Reiseplanung',
		description:
			'Allein umgesetzt, von der Idee bis zum Deployment. Funktioniert offline, gleicht sich mit der Cloud ab und erlaubt gemeinsames Planen in Echtzeit auf einer interaktiven Karte. Der Grund, warum ich Infrastruktur auch aus der Sicht derer verstehe, die darauf entwickeln.',
		stack: TABIYUME_STACK,
		link: 'https://www.tabiyume.de',
		cta: 'Projekt ansehen',
		imageAlt: 'Tabiyume Reiseplanung mit Japan-Karte, Reiseroute und Tagesplanung'
	},
	credentials: {
		title: 'Zertifizierungen',
		items: [
			{ name: 'Azure Virtual Desktop Specialty', issuer: 'Microsoft AZ-140', year: '2024' },
			{
				name: 'Security, Compliance and Identity Fundamentals',
				issuer: 'Microsoft SC-900',
				year: '2025'
			},
			{ name: 'Cybersecurity Certificate', issuer: 'Google', year: '2024' }
		]
	},
	contact: {
		title: 'Kontakt',
		intro: 'Für Rückfragen, Positionen oder einfach zum Kennenlernen.',
		email: 'dennis@wiredu.cloud'
	},
	caseStudy: {
		back: 'Alle Plattformen',
		context: 'Ausgangslage',
		task: 'Aufgabe',
		work: 'Umsetzung',
		outcome: 'Ergebnis',
		stack: 'Eingesetzt',
		scale: 'Größe',
		period: 'Zeitraum',
		sector: 'Branche'
	}
};

export const en: SiteContent = {
	meta: {
		title: 'Dennis Wiredu - Citrix Platform & Cloud Engineer',
		description:
			'Infrastructure engineer based in Munich. Building and running virtualization and cloud platforms for 700 to over 15,000 users.'
	},
	nav: {
		platforms: 'Platforms',
		approach: 'Approach',
		career: 'Career',
		project: 'Project',
		contact: 'Contact'
	},
	hero: {
		name: 'Dennis Wiredu',
		role: 'Citrix Platform & Cloud Engineer',
		positioning:
			'I build and run virtualization and cloud platforms for 700 to over 15,000 users.',
		ctaContact: 'Get in touch',
		ctaCv: 'CV (PDF)'
	},
	cv: { href: CV_HREF, note: 'Full CV as a PDF' },
	platforms: {
		title: 'Platforms',
		intro:
			'Four environments, from architecture through to day-to-day operations. Ordered by size, not by date.',
		items: [
			{
				slug: 'automotive-muenchen',
				name: 'Munich automotive manufacturer',
				sector: 'Automotive',
				period: '08/2023 - 09/2024',
				scaleValue: '15,000+',
				scaleLabel: 'users',
				summary: 'Automated and scaled one of the largest Citrix environments in the group.',
				context:
					'A Munich automotive manufacturer delivers workplaces to most of its workforce through Citrix. The environment had grown over years and, at more than 15,000 users, ranks among the largest in the group.',
				task: 'Automate day-to-day operations, keep golden-image management workable at that size, and bring the infrastructure up to a current release.',
				work: [
					'Automated recurring Citrix operations processes in PowerShell instead of continuing to run them by hand',
					'Owned PVS image management: the full golden-image lifecycle for more than 15,000 users',
					'Planned and executed a major upgrade of the Citrix infrastructure',
					'Built monitoring with Nagios and maintained the Ivanti personalization policies',
					'Provided 2nd and 3rd level support and captured operations in technical documentation and SOPs'
				],
				outcome:
					'Recurring operational work runs from scripts rather than by hand, the major upgrade is done, and operations are documented well enough to hand over.',
				stack: [
					'Citrix Virtual Apps & Desktops',
					'Citrix Provisioning Services',
					'PowerShell',
					'Nagios',
					'Ivanti',
					'Active Directory'
				]
			},
			{
				slug: 'bundesbehoerde',
				name: 'Federal agency',
				sector: 'Public sector',
				period: '08/2025 - 01/2026',
				scaleValue: '~7,000',
				scaleLabel: 'users',
				summary: 'Upgrades and incident resolution in a large government environment.',
				context:
					'A federal agency runs its workplaces on a Citrix environment serving around 7,000 users. Government environments change slowly and are tightly regulated: every adjustment has to be justified.',
				task: 'Bring the infrastructure to a maintained release level and trace complex incidents to their root cause rather than working around them.',
				work: [
					'Planned and executed upgrades and updates of the Citrix infrastructure',
					'Root-cause analysis of complex incidents at 2nd and 3rd level',
					'Wrote technical documentation and SOPs to standardize operations'
				],
				outcome:
					'The environment sits on a maintained release level, recurring incident patterns are traced to their cause, and operations are documented.',
				stack: [
					'Citrix Virtual Apps & Desktops',
					'Citrix NetScaler',
					'Active Directory',
					'ITSM & change management'
				]
			},
			{
				slug: 'greenfield-cvad',
				name: 'Religious institution, greenfield build',
				sector: 'Non-profit',
				period: '03/2025 - present',
				scaleValue: '~700',
				scaleLabel: 'users',
				summary: 'Full build of a CVAD platform, from architecture to go-live.',
				context:
					'A religious institution with around 700 users needed a new platform to deliver its workplaces. There was nothing to build on: a greenfield.',
				task: 'Own the platform from architecture to go-live, and design how it would be operated up front rather than adding that afterwards.',
				work: [
					'Set up architecture, sizing and configuration of the CVAD platform from scratch',
					'Designed the operations, deployment and release processes before the platform went live',
					'Built a personalization framework on Ivanti',
					'Tested systematically before the first user reached the platform'
				],
				outcome:
					'A platform that came into being together with its operating processes, instead of having them built around it later.',
				stack: [
					'Citrix Virtual Apps & Desktops',
					'Citrix NetScaler',
					'Ivanti',
					'Active Directory',
					'PowerShell'
				]
			},
			{
				slug: 'cvad-betrieb',
				name: 'Religious institution, operations',
				sector: 'Non-profit',
				period: '10/2024 - present',
				scaleValue: '~700',
				scaleLabel: 'users',
				summary: 'Ongoing operations and standardization of an existing CVAD platform.',
				context:
					'The same institution runs an existing CVAD platform alongside it. Much of it ran on well-practised steps that were written down nowhere.',
				task: 'Keep operations running and replace the manual routines with standard processes anyone can follow.',
				work: [
					'Carried out infrastructure upgrades and resolved incidents',
					'Managed the Ivanti personalization policies',
					'Replaced manual routines with documented standard processes'
				],
				outcome: 'Operations no longer depend on individual people but on documented processes.',
				stack: ['Citrix Virtual Apps & Desktops', 'Ivanti', 'Active Directory', 'PowerShell']
			}
		]
	},
	approach: {
		title: 'How I work',
		intro: 'Three things I handle the same way in every environment.',
		items: [
			{
				title: 'Automate whatever repeats',
				body: 'Recurring operational work belongs in a script, not in a click-by-click guide. It costs time once and removes a source of errors permanently.',
				tools: ['PowerShell', 'Terraform', 'Ansible', 'GitHub Actions (CI/CD)']
			},
			{
				title: 'Design operations before go-live',
				body: 'A platform is not finished when it runs, but when it is clear how it gets operated, updated and released day to day. Those processes come together with the architecture, not after it.',
				tools: [
					'Citrix Virtual Apps & Desktops',
					'Citrix NetScaler',
					'Provisioning Services',
					'Azure Virtual Desktop',
					'Microsoft Azure & 365',
					'Ivanti'
				]
			},
			{
				title: 'Hand over so it runs without me',
				body: 'Anything that exists only in my head is a risk for the client. Documentation and SOPs are part of the delivery, not the job that comes after it.',
				tools: [
					'Technical documentation',
					'SOP authoring',
					'ITSM & change management',
					'Nagios monitoring',
					'Active Directory'
				]
			}
		]
	},
	career: {
		title: 'How I got here',
		intro:
			'I did not take the straight route into IT. I worked in wholesale purchasing, went back to school for a university entrance qualification, and worked my way into infrastructure through working-student roles.',
		closing:
			'Seven years separate the first working-student role from owning platforms with 15,000 users. What stayed: I learn systems by operating them.',
		stations: [
			{
				id: 'hausladen',
				track: 'commercial',
				company: 'Hausladen Fruchthandels GmbH',
				role: 'Apprenticeship in wholesale and foreign trade (IHK)',
				period: '09/2011 - 06/2014',
				year: '2011',
				summary: 'Three-year dual apprenticeship in wholesale, completed with the IHK exam.',
				bullets: ['Commercial apprenticeship in wholesale and foreign trade, IHK certified']
			},
			{
				id: 'notebooksbilliger',
				track: 'commercial',
				company: 'notebooksbilliger.de',
				role: 'Purchaser',
				period: '12/2014 - 09/2015',
				year: '2014',
				summary: 'Purchasing for an online consumer electronics retailer.',
				bullets: ['Purchasing and supplier communication in electronics retail']
			},
			{
				id: 'businesscoffee',
				track: 'commercial',
				company: 'Business-Coffee GmbH',
				role: 'Purchaser / Purchase Manager',
				period: '10/2015 - 12/2016',
				year: '2015',
				summary: 'Ran purchasing end to end, the last role before moving into IT.',
				bullets: ['Purchasing and supplier relationships']
			},
			{
				id: 'bos',
				track: 'it',
				company: 'Berufliche Oberschule (BOS) Munich',
				role: 'General higher education entrance qualification (second-chance route)',
				period: '2017 - 2019',
				year: '2017',
				summary: 'The second-chance route to a university entrance qualification, where the move into IT began.',
				bullets: ['General higher education entrance qualification via the second-chance route']
			},
			{
				id: 'lmu',
				track: 'it',
				company: 'Ludwig Maximilian University of Munich',
				role: 'Media informatics studies (5 semesters, unfinished)',
				period: '10/2020 - 02/2023',
				year: '2020',
				summary:
					'Focused on human-computer interaction. Left when the work in IT consulting offered more substance than the degree.',
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
				year: '2021',
				summary:
					'Maintained network infrastructure and internal services for an IT solutions provider.',
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
				year: '2022',
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
				role: 'Citrix Engineer to Citrix Consultant',
				period: '02/2023 - present',
				year: '2023',
				summary:
					'From trainee to consultant in virtualization: building, running, and automating Citrix platforms serving 700 to 15,000+ users.',
				bullets: [
					'02/2023 - 07/2023: trainee program covering virtualization, Active Directory, networking, Citrix NetScaler, CVAD, and Azure and M365 fundamentals',
					'Since 08/2023: Citrix Consultant focused on building, operating, and automating large virtualization platforms'
				]
			}
		]
	},
	project: {
		title: 'Alongside the platform work',
		name: 'Tabiyume',
		tagline: 'Trip-planning app',
		description:
			'Built entirely on my own, from the first idea to deployment. It works offline, syncs to the cloud, and lets people plan together in real time on an interactive map. The reason I also understand infrastructure from the perspective of the people building on it.',
		stack: TABIYUME_STACK,
		link: 'https://www.tabiyume.de',
		cta: 'View project',
		imageAlt: 'Tabiyume trip planner showing a map of Japan, itinerary and daily schedule'
	},
	credentials: {
		title: 'Certifications',
		items: [
			{ name: 'Azure Virtual Desktop Specialty', issuer: 'Microsoft AZ-140', year: '2024' },
			{
				name: 'Security, Compliance and Identity Fundamentals',
				issuer: 'Microsoft SC-900',
				year: '2025'
			},
			{ name: 'Cybersecurity Certificate', issuer: 'Google', year: '2024' }
		]
	},
	contact: {
		title: 'Contact',
		intro: 'For questions, open positions, or simply to say hello.',
		email: 'dennis@wiredu.cloud'
	},
	caseStudy: {
		back: 'All platforms',
		context: 'Starting point',
		task: 'Brief',
		work: 'What I did',
		outcome: 'Outcome',
		stack: 'Used',
		scale: 'Size',
		period: 'Period',
		sector: 'Sector'
	}
};

export function contentFor(lang: 'de' | 'en'): SiteContent {
	return lang === 'de' ? de : en;
}

export function platformFor(lang: 'de' | 'en', slug: string): Platform | undefined {
	return contentFor(lang).platforms.items.find((item) => item.slug === slug);
}

/** Slugs are shared across languages, so either list works for prerendering. */
export const platformSlugs = de.platforms.items.map((item) => item.slug);
