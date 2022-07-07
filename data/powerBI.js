exports.module = {
    partner : [
        {
            workspaceid:'8381dd05-0c7c-4d4f-90a0-fd7a3ee7a51a',
		    workspace_name: 'partner workspace',
            access:
                {
                    user: ['daya','swat'],
                }
            ,
            reports: [
                {
                    reportId: 'c71cca19-aaf2-4c16-9c43-4c7618404cc7',
			        report_name: 'Partner Report',
                    access:
                        {
                            user: ['daya','swat'],
                            name: 'abc',
                        }
                },
               
            ]
        }
    ],
    patient : [
        {
            workspaceid:'64fbbfba-b7e1-445b-9329-4cb459abfaf3',
		    workspace_name: 'Patient Workspace',
            access:
                {
                    user: ['daya','swat'],
                }
            ,
            reports: [
                {
                    reportId: '376ed462-d721-4bbd-808e-c7ad1132bcf4',
			        report_name: 'Patient Report',
                    access:
                        {
                            user: ['daya'],
                            name: 'abc',
                        }
                },
               
            ]
        }
    ],

    staff : 
        [
            {
                workspaceid:'9c1cffa0-9929-4622-92a9-596ba8ffcd7d',
                workspace_name: 'Staff Workspace',
                access:
                    {
                        user: ['daya','ankit'],
                    }
                ,
                reports: [
                    {
                        reportId: 'f15f26b2-fc67-416e-9431-363a7d2f2be5',
                        report_name: 'Staff Report',
                        access:
                            {
                                user: ['ankit'],
                                name: 'abc',
                            }
                    },
                
                ]
            }
        ]
}