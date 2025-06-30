const uuidv4 = require('uuid');
const moment = require('moment');
const path = require('path');
const ejs = require('ejs');
const { Op } = require("sequelize");
const sequelize = require('../utils/dbconnector');
const qs = require('querystring');
const switchcase = require('switchcase');

const companytype = require('../models/company/companytype');
const company = require('../models/company/company');
const department = require('../models/academicmast/department');
const program = require('../models/academicmast/program');
const academiclvl = require('../models/academicmast/academiclvl');
const studyfield = require('../models/academicmast/studyfield');
const progmqadtls = require('../models/academicmast/progmqadtls');
const progkptdtls = require('../models/academicmast/progkptdtls');
const semester = require('../models/academicmast/semester');
const subject = require('../models/academicmast/subject');
const currency = require('../models/general/currency');
const country = require('../models/general/country');
const psconfig = require('../models/academicmast/psconfig');
const topic = require('../models/academicmast/topics');
const assessment = require('../models/academicmast/assessment');

const school = require('../models/acadenicmast/school');

exports.getschooldatabyid = (req,res,next)=> {
    let allschooldata;
    let schoolid='';

    school.findAll({
        where:{
            id:schoolid,
        }
    }).then((allschools)=>{
console.log(allschools);
    })
    
}
exports.getacademicidxmast = (req,res,next) => {

    let allcompanies, allacademiclvl, allstudyfield, allcurrency;

    let x = currency.findAll();
    let y = country.findAll();

    company.findAll({
        where: {
            tenantid: req.body.tenantID
        },
        include: [{model:companytype, require: true}]
    }).then(allcomps=>{
        allcompanies = allcomps.map((element)=>{
            return{
                name: element.legalname + ' (' + element.tblcompanytype.typename + ')',
                id: element.id
            }
        });

        academiclvl.findAll({
            order:[
                ['lvlnum', 'ASC'],
            ],
        }).then(alllvl=>{
            allacademiclvl = alllvl.map((element)=>{
                return{
                    name: element.lvlname,
                    id:element.id,
                }
            });

            studyfield.findAll({
                order:[
                    ['fieldname', 'ASC'],
                ],
            }).then(allfd=>{
                allstudyfield = allfd.map((element)=>{
                    return{
                        name: element.fieldname,
                        id:element.id,
                    }
                });

                currency.findAll({
                    order:[
                        ['currency','ASC'],
                    ]
                }).then(curr=>{
                    allcurrency = curr.map((element)=>{
                        return{
                            name:element.currency,
                            id:element.id,
                        }
                    });

                    res.status(200).render('academics/index', {pageTitle : 'Academic Management || '+req.body.profile.tenantsname+' Online System',pageName:'Academic Manage',msg:'',sts:'',data:{
                        profile:req.body.profile,
                        allmenus:req.body.allmenus,
                        allcompanies:allcompanies,
                        allacademiclvl:allacademiclvl,
                        allstudyfield:allstudyfield,
                        allcurrency:allcurrency
                    }});
                })
            })
        })
    });
};

exports.getdeptdata = (req,res,next)=> {

    let alldepts;

    department.findAll({
        where:{
            compid:req.query.companyid,
        },
        order: [
            ['name', 'ASC'],
        ],
        include: [{model:company, require: true}]
    }).then(depts=>{
        alldepts = depts.map((element)=>{
            return{
                ID: element.id,
                name: element.name+' ('+element.code+')',
                cname: element.name+' ('+element.tblcompany.legalname+')',
                'Department Name': element.name+' ('+element.code+')',
                Description: element.desc,
                'HOD Name': element.hod_name,
                'HOD Email': element.hod_email,
                Status: (element.sts==1?'Active':'In-Active')
            }
        });
        

        return res.status(200).send({data:{
            alldepts:alldepts,
        },success:true,err:null});
    })
      
};

exports.getdeptdatabyid = (req,res,next)=> {

    let alldepts;

    department.findAll({
        where:{
            compid:req.query.companyid,
            id:req.query.id,
        },
        
        include: [{model:company, require: true}]
    }).then(depts=>{
        alldepts = depts.map((element)=>{
            return{
                id: element.id,
                compid:element.compid,
                cname: element.name+' ('+element.tblcompany.legalname+')',
                name: element.name,
                code:element.code,
                description: element.desc,
                hodname: element.hod_name,
                hodemail: element.hod_email,
                status: (element.sts==1?'Active':'In-Active'),
                sts: element.sts,
            }
        });
        return res.status(200).send({data:{
            alldepts:alldepts,
        },success:true,err:null});
    })
      
};

exports.postnewdeptadd = (req,res,next) => {
    
    department.findOne({
        where:{
            name:req.body.deptname,
            compid:req.body.compid,
        }
    }).then(item=>{
        if(!item){
            department.create({
                id:uuidv4.v4(),
                tenantid:req.body.tenantID,
                compid:req.body.compid,
                deptype:'aca',
                name:req.body.deptname,
                code:req.body.deptcode,
                desc:req.body.deptdesc,
                hod_name:req.body.hodname,
                hod_email:req.body.hodemail,
                sts:1,
                createdby: req.body.userID,
            }).then(()=>{
                return res.status(200).send({data:{msg:"Department Created Successfully."},success:true,err:null});
            });

        }else{
            return res.status(200).send({data:{msg:"Department already in existence. Cannot create duplicate value."},success:false,err:null});
        }
    })
    
};

exports.postupdatedept = (req,res,next) => {

    department.findOne({
        where:{
            name: req.body.editdeptname,
            compid:req.body.editcompany,
            id:{[Op.ne]: req.body.editdeptid},
        }
    }).then(item=>{
        if(!item){
            department.update(
                {
                    compid:req.body.editcompany,
                    name:req.body.editdeptname,
                    code:req.body.editdeptcode,
                    desc:req.body.editdeptdesc,
                    hod_name:req.body.edithodname,
                    hod_email:req.body.edithodemail,
                    sts:(req.body.chkeditstatus?1:0),
                },
                { where: { id: req.body.editdeptid } }
            ).then(()=>{
                return res.status(200).send({data:{msg:"Department details updated successfully.",},success:true,err:null});
            });
        }else{
            return res.status(200).send({data:{msg:"Department name already in existence. Cannot update with duplicate value."},success:false,err:null});
        }
    })
    
};

exports.postdeldept = (req,res,next) => {

    department.destroy({
        where:{
            id:req.body.id
        }
    }).then(()=>{
        return res.status(200).send({data:{msg:"Department deleted successfully."},success:true,err:null});
    }).catch(function (err) {
        return res.status(200).send({data:{msg:"One or more items are under this department. Cannot delete."},success:false,err:null});
    });

};

exports.postnewprogadd = async (req,res,next) => {
    let semdata = JSON.parse(req.body.semdata);
    let progdata = qs.parse(req.body.progdata);
    let sem = [];
    program.findOne({
        where:{
            code:progdata.progcode,
        }
    }).then(async item=>{
        if(!item){

            let progid = uuidv4.v4();
            
            semdata.forEach(element => {
                sem.push({
                    id:uuidv4.v4(),
                    progid:progid,
                    sem_type:element.semtype,
                    sem_slno:element.semslno,
                    year:element.year,
                    sem:element.sem,
                    type:element.type,
                    duration:element.duration,
                    credits:element.semcredit,
                    createdby: req.body.userID,
                });
            });

            const result = await sequelize.transaction(async (t) => {

                await program.create({
                    id:progid,
                    deptid:progdata.deptid,
                    name: progdata.progname,
                    code: progdata.progcode,
                    progsts: progdata.progsts,
                    aliasname:progdata.proganame,
                    shortname:progdata.progsname,
                    nativename:progdata.prognname,
                    ftminduration:progdata.ftminduration,
                    ftmaxduration:progdata.ftmaxduration,
                    ptminduration:progdata.ptminduration,
                    ptmaxduration:progdata.ptmaxduration,
                    academiclvlid:progdata.academiclvl,
                    studyfieldid:progdata.studyfield,
                    studytype:progdata.studytype,
                    studymode:progdata.studymode,
                    credits:progdata.credits,
                    localfeescur:progdata.localfeescur,
                    intlfeescur:progdata.intlfeescur,
                    ftlocalfees:progdata.domftfees,
                    ftintlfees:progdata.intlftfees,
                    ptlocalfees:progdata.domptfees,
                    ptintlfees:progdata.intlptfees,
                    sts: 1,
                    createdby: req.body.userID,
                }, { transaction: t });
    
                await semester.bulkCreate(sem, { transaction: t });
                
            });

            return res.status(200).send({data:{msg:"Program Created Successfully."},success:true,err:null});

        }else{
            return res.status(200).send({data:{msg:"Program already in existence undeer the department. Cannot create duplicate program."},success:false,err:null});
        }
    });
    
};

exports.getprogdata = (req,res,next)=> {

    let allprog;

    program.findAll({
        where:{
            deptid:req.query.deptid,
        },
        order: [
            ['name', 'ASC'],
        ],
        include: [
            {model:academiclvl, require: true},
            {model:studyfield, require:true},
            {model:currency, as: "lcurr", require:true},
            {model:currency, as: "icurr", require:true},
        ]
    }).then(progs=>{
        allprog = progs.map((element)=>{
            let type = switchcase({
                'cw': "Coursework",
                'rw': "Researchwork",
                'mix': "Mixed",
                default: "Defaulted"
            });
            return{
                ID: element.id,
                'Program Name': element.name+' ('+element.code+')<br><b>Alias: </b>'+element.aliasname+'<br><b>Native: </b>'+element.nativename+'<br><b>Status: </b>'+element.progsts,
                'Short Name': element.shortname,
                'Credits': Math.round(element.credits,2),
                'Level': element.tblacademiclvl.lvlname,
                'Duration': '<b>Full Time:</b><br>Min. Dur.: '+element.ftminduration+'<br>Max Dur.: '+element.ftmaxduration+'<br><b>Part Time:</b><br>Min. Dur.: '+element.ptminduration+'<br>Max Dur.: '+element.ptmaxduration,
                'Study Details': 'Mode: '+(element.studymode=='rg'?'Conventional':'ODL')+'<br>Type: ' + type(element.studytype),
                'Fees': '<b>Full Time:</b><br>Dom. Fees: '+element.ftlocalfees+' ('+element.lcurr.currency+')<br>Intl. Fees: '+element.ftintlfees+' ('+element.icurr.currency+')<br><b>Part Time:</b><br>Dom. Fees: '+element.ptlocalfees+' ('+element.lcurr.currency+')<br>Intl. Fees: '+element.ptintlfees+' ('+element.icurr.currency+')',
                Status: (element.sts==1?'<b>Active</b>':'<b>In-Active</b>')
            };
        });
        return res.status(200).send({data:{
            allprog:allprog,
        },success:true,err:null});
    });
};

exports.getprogdatabyid = (req,res,next)=> {

    let allprog, allsem, allsub;

    program.findAll({
        where:{
            id:req.query.id,
        },
        include: [
            {model:department, require: true},
        ]
    }).then(prog=>{
        allprog = prog.map((element)=>{
            return{
                id: element.id,
                deptid: element.deptid,
                compid: element.tbldepartment.compid,
                name: element.name,
                code: element.code,
                progsts: element.progsts,
                aliasname: element.aliasname,
                shortname: element.shortname,
                nativename: element.nativename,
                ftminduration: element.ftminduration,
                ftmaxduration: element.ftmaxduration,
                ptminduration: element.ptminduration,
                ptmaxduration: element.ptmaxduration,
                academiclvlid: element.academiclvlid,
                studyfieldid: element.studyfieldid,
                studytype: element.studytype,
                studymode: element.studymode,
                credits: element.credits,
                ftlocalfees: element.ftlocalfees,
                ftintlfees: element.ftintlfees,
                localfeescur: element.localfeescur,
                ptlocalfees: element.ptlocalfees,
                ptintlfees: element.ptintlfees,
                intlfeescur: element.intlfeescur,
                status: (element.sts==1?'Active':'In-Active'),
                sts: element.sts,
            }
        });

        semester.findAll({
            where:{
                progid:allprog[0].id,
            },
            order:[
                ['sem_type', 'ASC'],
                [sequelize.fn('length', sequelize.col('year')), 'ASC'],
                ['year', 'ASC'],
                [sequelize.fn('length', sequelize.col('sem')), 'ASC'],
                ['sem', 'ASC'],
            ]
        }).then(semes=>{
            allsem = semes.map((element)=>{
                return{
                    id: element.id,
                    semtype:element.sem_type,
                    semslno:element.sem_slno,
                    progid:element.progid,
                    year:element.year,
                    sem:element.sem,
                    type:element.type,
                    duration:element.duration,
                    credits:element.credits,
                }
            });

            subject.findAll({
                where:{
                    compid:allprog[0].compid
                },
                order: [
                    ['name', 'ASC'],
                ],
            }).then((subs)=>{
                allsub = subs.map((element)=>{
                    return{
                        id: element.id,
                        compid:element.compid,
                        subname: element.name,
                        subcode: element.code,
                        credit:element.credit,
                        synopsis: element.synopsis,
                        sts: element.sts,
                    };
                });
                return res.status(200).send({data:{
                    allprog:allprog,
                    allsem:allsem,
                    allsub:allsub,
                },success:true,err:null});
            });
        });
    });
      
};

exports.postnewprogupdt = (req,res,next) => {
    let progdata = qs.parse(req.body.progdata);
    program.findOne({
        where:{
            code:progdata.editprogcode,
            id:{[Op.ne]: progdata.editprogid},
        }
    }).then(item=>{
        if(!item){

            program.update({
                deptid:progdata.progeditdept,
                name: progdata.editprogname,
                code: progdata.editprogcode,
                progsts: progdata.editprogsts,
                aliasname:progdata.editproganame,
                shortname:progdata.editprogsname,
                nativename:progdata.editprognname,
                ftminduration:progdata.editftminduration,
                ftmaxduration:progdata.editftmaxduration,
                ptminduration:progdata.editptminduration,
                ptmaxduration:progdata.editptmaxduration,
                academiclvlid:progdata.editacademiclvl,
                studyfieldid:progdata.editstudyfield,
                studytype:progdata.editstudytype,
                studymode:progdata.editstudymode,
                credits:progdata.editcredits,
                localfeescur:progdata.editlocalfeescur,
                intlfeescur:progdata.editintlfeescur,
                ftlocalfees:progdata.editdomftfees,
                ftintlfees:progdata.editintlftfees,
                ptlocalfees:progdata.editdomptfees,
                ptintlfees:progdata.editintlptfees,
                sts:(progdata.chkeditprogstatus?1:0),
            },
            { where: { id: progdata.editprogid } });
    

            return res.status(200).send({data:{msg:"Program Updated Successfully."},success:true,err:null});

        }else{
            return res.status(200).send({data:{msg:"Program name already in existence under the department. Cannot update program."},success:false,err:null});
        }
    });
    
};

exports.postdelprog = (req,res,next) => {

    semester.findOne({
        where:{
            progid:req.body.id
        }
    }).then(item=>{
        if(!item){
            program.destroy({
                where:{
                    id:req.body.id
                }
            }).then(()=>{
                return res.status(200).send({data:{msg:"Program deleted successfully."},success:true,err:null});
            }).catch(function (err) {
                return res.status(200).send({data:{msg:"One or more items are under this program. Cannot delete."},success:false,err:null});
            });
        } else{
            return res.status(200).send({data:{msg:"One or more semestrs are under this program. Please delete the semester before deleting program."},success:false,err:null});
        }
    })
};

exports.postaddsem = (req,res,next) => {

    let semdata = JSON.parse(req.body.semdata);

    semester.findAll({
        where:{
            progid:req.body.progid,
            sem_type:semdata[0].semtype,
            year:semdata[0].year,
            sem:semdata[0].sem,
        }
    }).then(sem=>{
        if(sem.length!=0){
            return res.status(200).send({data:{msg:"Cannot create new semester. Same semester and year already exist in the selected program."},success:false,err:null});
        }
        else{
            semdata.forEach(element => {
                sem.push({
                    id:uuidv4.v4(),
                    progid:req.body.progid,
                    sem_type:element.semtype,
                    sem_slno:element.semslno,
                    year:element.year,
                    sem:element.sem,
                    type:element.type,
                    duration:element.duration,
                    credits:element.semcredit,
                    createdby: req.body.userID,
                });
            });

            semester.bulkCreate(sem).then(()=>{
                return res.status(200).send({data:{msg:"New semester created successfully."},success:true,err:null});
            });
        }
    });
};

exports.postdelsem = (req,res,next) => {

    semester.destroy({
        where:{
            id:req.body.id
        }
    }).then(()=>{
        return res.status(200).send({data:{msg:"Semester deleted successfully."},success:true,err:null});
    }).catch(function (err) {
        return res.status(200).send({data:{msg:"One or more items are under this Semester. Cannot delete."},success:false,err:null});
    });

};

exports.posteditsem = (req,res,next) => {

    let semdata = JSON.parse(req.body.semdata);

    semester.findAll({
        where:{
            progid:req.body.progid,
            sem_type:semdata[0].semtype,
            year:semdata[0].year,
            sem:semdata[0].sem,
            id:{[Op.ne]: semdata[0].id},
        }
    }).then(sem=>{
        if(sem.length==0){
            semester.update({
                sem_type:semdata[0].semtype,
                sem_slno:semdata[0].semslno,
                year:semdata[0].year,
                sem:semdata[0].sem,
                type:semdata[0].type,
                duration:semdata[0].duration,
                credits:semdata[0].semcredit,
            },
            { where: { id: semdata[0].id } }).then(()=>{
                return res.status(200).send({data:{msg:"semester details updated successfully."},success:true,err:null});
            });
        }
        else{
            return res.status(200).send({data:{msg:"Cannot edit semester. Same semester and year already exist in the selected program."},success:false,err:null});
        }
    });
};

exports.getprogmqadtlsbyprogid = (req,res,next)=> {

    let allprogmqadtls;

    progmqadtls.findAll({
        where:{
            progid:req.query.id,
        },
    }).then(dtls=>{
        allprogmqadtls = dtls.map((element)=>{
            return{
                id: element.id,
                mqacode:element.mqacode,
                mqaappdt:element.mqaappdt,
                mqaexpdt:element.mqaexpdt,
                mqaofficername:element.mqaofficername,
                mqaofficercontact:element.mqaofficercontact,
                mqaofficeremail:element.mqaofficeremail,
            }
        });

        return res.status(200).send({data:{
            allprogmqadtls:allprogmqadtls,
        },success:true,err:null});
    });
      
};

exports.getprogkptdtlsbyprogid = (req,res,next)=> {

    let allprogkptdtls;

    progkptdtls.findAll({
        where:{
            progid:req.query.id,
        },
    }).then(dtls=>{
        allprogkptdtls = dtls.map((element)=>{
            return{
                id: element.id,
                kptcode:element.kptcode,
                kptappdt:element.kptappdt,
                kptexpdt:element.kptexpdt,
                kptpublishcode:element.kptpublishcode,
            }
        });

        return res.status(200).send({data:{
            allprogkptdtls:allprogkptdtls,
        },success:true,err:null});
    });
      
};

exports.postnewprogmqadtlsadd = (req,res,next) => {

    progmqadtls.findOne({
        where:{
            progid:req.body.progid,
            mqaappdt:moment(req.body.mqaappdt, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        }
    }).then(item=>{
        if(!item){
            progmqadtls.create({
                id:uuidv4.v4(),
                progid:req.body.progid,
                mqacode:req.body.mqacode,
                mqaappdt:moment(req.body.mqaappdt, 'DD/MM/YYYY').toDate(),
                mqaexpdt:(req.body.mqaexpdt.length>0?moment(req.body.mqaexpdt, 'DD/MM/YYYY').toDate():null),
                mqaofficername:req.body.mqaofficername,
                mqaofficercontact:req.body.mqaofficercontact,
                mqaofficeremail:req.body.mqaofficeremail,
                createdby: req.body.userID,
            }).then(()=>{
                return res.status(200).send({data:{msg:"MQA Approval details saved successfully."},success:true,err:null});
            });

        }else{
            return res.status(200).send({data:{msg:"MQA Approval details already in existence against this approval date. Cannot create duplicate value."},success:false,err:null});
        }
    })
    
};

exports.postnewprogkptdtlsadd = (req,res,next) => {
    
    progkptdtls.findOne({
        where:{
            progid:req.body.progid,
            kptappdt:moment(req.body.kptappdt, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        }
    }).then(item=>{
        if(!item){
            progkptdtls.create({
                id:uuidv4.v4(),
                progid:req.body.progid,
                kptcode:req.body.kptcode,
                kptappdt:moment(req.body.kptappdt, 'DD/MM/YYYY').toDate(),
                kptexpdt:moment(req.body.kptexpdt, 'DD/MM/YYYY').toDate(),
                kptpublishcode:req.body.kptpublishcode,
                createdby: req.body.userID,
            }).then(()=>{
                return res.status(200).send({data:{msg:"KPT Approval details saved successfully."},success:true,err:null});
            });

        }else{
            return res.status(200).send({data:{msg:"KPT Approval details already in existence against this approval date. Cannot create duplicate value."},success:false,err:null});
        }
    })
    
};

exports.postdelprogmqadtls = (req,res,next) => {

    progmqadtls.destroy({
        where:{
            id:req.body.id
        }
    }).then(()=>{
        return res.status(200).send({data:{msg:"MQA Approval details deleted successfully."},success:true,err:null});
    }).catch(function (err) {
        return res.status(200).send({data:{msg:"One or more items are under this subject. Cannot delete."},success:false,err:null});
    });

};

exports.postdelprogkptdtls = (req,res,next) => {

    progkptdtls.destroy({
        where:{
            id:req.body.id
        }
    }).then(()=>{
        return res.status(200).send({data:{msg:"KPT Approval details deleted successfully."},success:true,err:null});
    }).catch(function (err) {
        return res.status(200).send({data:{msg:"One or more items are under this subject. Cannot delete."},success:false,err:null});
    });

};

exports.postnewsubadd = (req,res,next) => {
    
    subject.findOne({
        where:{
            code:req.body.subcode,
            compid:req.body.subcompid,
        }
    }).then(item=>{
        if(!item){
            subject.create({
                id:uuidv4.v4(),
                compid:req.body.subcompid,
                name:req.body.subname,
                code:req.body.subcode,
                credit:req.body.subcredits,
                synopsis:req.body.subsynopsis,
                sts:1,
                createdby: req.body.userID,
            }).then(()=>{
                return res.status(200).send({data:{msg:"Subject created successfully."},success:true,err:null});
            });

        }else{
            return res.status(200).send({data:{msg:"Subject code already in existence. Cannot create duplicate value."},success:false,err:null});
        }
    })
    
};

exports.getsubdata = (req,res,next)=> {

    let allsub;

    subject.findAll({
        where:{
            compid:req.query.companyid,
        },
        order: [
            ['name', 'ASC'],
        ],
        include: [{model:company, require: true}]
    }).then(sub=>{
        allsub = sub.map((element)=>{
            return{
                ID: element.id,
                'Subject Name': element.name,
                'Subject Code': element.code,
                Credits: element.credit,
                Synopsis: element.synopsis,
                Status: (element.sts==1?'Active':'In-Active')
            }
        });
        

        return res.status(200).send({data:{
            allsub:allsub,
        },success:true,err:null});
    })
      
};

exports.getsubdatabyid = (req,res,next)=> {

    let allsub;

    subject.findAll({
        where:{
            compid:req.query.companyid,
            id:req.query.id,
        },
        include: [{model:company, require: true}]
    }).then(sub=>{
        allsub = sub.map((element)=>{
            return{
                id: element.id,
                compid:element.compid,
                subname: element.name,
                subcode: element.code,
                credit:element.credit,
                synopsis: element.synopsis,
                status: (element.sts==1?'Active':'In-Active'),
                sts: element.sts,
            }
        });
        return res.status(200).send({data:{
            allsub:allsub,
        },success:true,err:null});
    })
      
};

exports.postnewsubedit = (req,res,next) => {
    
    subject.findOne({
        where:{
            code:req.body.subjeditcompany,
            compid:req.body.subjeditcompany,
        }
    }).then(item=>{
        if(!item){
            subject.update({
                compid:req.body.subjeditcompany,
                name:req.body.editsubname,
                code:req.body.editsubcode,
                credit:req.body.editsubcredits,
                synopsis:req.body.editsubsynopsis,
                sts:(req.body.chkeditsubstatus?1:0),
            },{ where:{ id:req.body.editsubid } }).then(()=>{
                return res.status(200).send({data:{msg:"Subject updated successfully."},success:true,err:null});
            });

        }else{
            return res.status(200).send({data:{msg:"Subject code already in existence under same company. Cannot create duplicate value."},success:false,err:null});
        }
    })
    
};

exports.postdelsub = (req,res,next) => {

    subject.destroy({
        where:{
            id:req.body.id
        }
    }).then(()=>{
        return res.status(200).send({data:{msg:"Subject deleted successfully."},success:true,err:null});
    }).catch(function (err) {
        return res.status(200).send({data:{msg:"One or more items are under this subject. Cannot delete."},success:false,err:null});
    });

};

exports.getpsconfigdata = (req,res,next)=> {

    let allpsconfig;

    psconfig.findAll({
        where:{
            semid:req.query.semid,
        },
        order: [
            [sequelize.fn('length', sequelize.col('slno')), 'ASC'],
            ['slno', 'ASC'],
        ],
        include: [{model:subject, require: true}]
    }).then(sub=>{
        allpsconfig = sub.map((element)=>{
            return{
                id: element.id,
                slno:element.slno,
                name: element.tblsubject.name,
                code:element.tblsubject.code,
                credit: element.tblsubject.credit,
                version: element.version,
                type: element.type,
            }
        });
        
        return res.status(200).send({data:{
            allpsconfig:allpsconfig,
        },success:true,err:null});
    })
      
};

exports.postpsconfigadd = (req,res,next) => {
    
    psconfig.findOne({
        where:{
            progid:req.body.psconfigprogid,
            subjectid:req.body.psconfigsub,
            version:req.body.psconfigsubver,
        }
    }).then(item=>{
        if(!item){

            psconfig.findAll({
                where:{
                    semid:req.body.psconfigsem,
                },
                attributes: [
                    [sequelize.fn('max', sequelize.col('slno')), 'max'],
                    'semid'
                ],
                group: ['semid']
            }).then(slno=>{
                let sl = 1;
                if(slno.length>0){
                    sl = slno[0].dataValues.max + 1;
                };

                psconfig.create({
                    id:uuidv4.v4(),
                    progid:req.body.psconfigprogid,
                    semid:req.body.psconfigsem,
                    subjectid:req.body.psconfigsub,
                    slno:sl,
                    version:req.body.psconfigsubver,
                    type:req.body.psconfigsubtype,
                    createdby: req.body.userID,
                }).then(()=>{
                    return res.status(200).send({data:{msg:"Subject configured successfully."},success:true,err:null});
                }).catch((error) => {
                    return res.status(200).send({data:{msg:"An error occured: " + error},success:false,err:null});
                });

            }).catch((error) => {
                return res.status(200).send({data:{msg:"An error occured: " + error},success:false,err:null});
            });

        }else{
            return res.status(200).send({data:{msg:"Subject has been already configured with the program under current version. Cannot create duplicate value."},success:false,err:null});
        }
    }).catch((error) => {
        return res.status(200).send({data:{msg:"An error occured: " + error},success:false,err:null});
    });
};

exports.postpsconfigdel = (req,res,next) => {

    psconfig.destroy({
        where:{
            id:req.body.id
        }
    }).then(()=>{
        return res.status(200).send({data:{msg:"Subject deleted successfully from the semester."},success:true,err:null});
    }).catch(function (err) {
        return res.status(200).send({data:{msg:"One or more items are under this configuration. Cannot delete."},success:false,err:null});
    });

};

exports.posttopicadd = (req,res,next) => {
    
    topic.findOne({
        where:{
            subjectid:req.body.topicsubid,
            version:req.body.topicsubver,
            name:req.body.topicname,
        }
    }).then(item=>{
        if(!item){
            topic.findAll({
                where:{
                    subjectid:req.body.topicsubid,
                },
                attributes: [
                    [sequelize.fn('max', sequelize.col('slno')), 'max'],
                    'subjectid'
                ],
                group: ['subjectid']
            }).then(slno=>{
                let sl = 1;
                if(slno.length>0){
                    sl = slno[0].dataValues.max + 1;
                };

                topic.create({
                    id:uuidv4.v4(),
                    subjectid:req.body.topicsubid,
                    slno:sl,
                    version:req.body.topicsubver,
                    name:req.body.topicname,
                    desc:req.body.topicdesc,
                    createdby: req.body.userID,
                }).then(()=>{
                    return res.status(200).send({data:{msg:"Topic add successfully to the subject."},success:true,err:null});
                });

            });

        }else{
            return res.status(200).send({data:{msg:"Topic has already been added with the subject under current version. Cannot create duplicate value."},success:false,err:null});
        }
    })
};

exports.gettopicdata = (req,res,next)=> {

    let alltopics;

    topic.findAll({
        where:{
            subjectid:req.query.subjectid,
        },
        order: [
            [sequelize.fn('length', sequelize.col('slno')), 'ASC'],
            ['slno', 'ASC'],
        ],
        include: [{model:subject, require: true}]
    }).then(topics=>{
        alltopics = topics.map((element)=>{
            return{
                id: element.id,
                slno: element.slno,
                version: element.version,
                topicname: element.name,
                topicdesc: element.desc,
            }
        });
        
        return res.status(200).send({data:{
            alltopics:alltopics,
        },success:true,err:null});
    })
      
};

exports.posttopicdel = (req,res,next) => {

    topic.destroy({
        where:{
            id:req.body.id
        }
    }).then(()=>{
        return res.status(200).send({data:{msg:"Topic deleted successfully from the semester."},success:true,err:null});
    }).catch(function (err) {
        return res.status(200).send({data:{msg:"One or more items are under this topics. Cannot delete."},success:false,err:null});
    });

};

exports.posttopicedit = (req,res,next) => {
    
    topic.findOne({
        where:{
            id:{[Op.ne]: req.body.topicid},
            subjectid:req.body.topicsubid,
            version:req.body.topicsubver,
            name:req.body.topicname,
        }
    }).then(item=>{
        if(!item){
            topic.update({
                slno:req.body.slno,
                version:req.body.topicsubver,
                name:req.body.topicname,
                desc:req.body.topicdesc,
            },{ where:{ id:req.body.topicid } }).then(()=>{
                return res.status(200).send({data:{msg:"Topic updated successfully."},success:true,err:null});
            });

        }else{
            return res.status(200).send({data:{msg:"Same topic name already in existence under current version and subject. Cannot create duplicate value."},success:false,err:null});
        }
    })
    
};

exports.getassessmentdata = (req,res,next)=> {

    let allassessment;

    assessment.findAll({
        where:{
            compid:req.query.companyid,
        },
        order: [
            ['assessmentname', 'ASC'],
        ],
        include: [{model:company, require: true}]
    }).then(assessment=>{
        allassessment = assessment.map((element)=>{
            return{
                ID: element.id,
                'Assessment Name': element.assessmentname,
                Status: (element.sts==1?'Active':'In-Active')
            }
        });
        

        return res.status(200).send({data:{
            allassessment:allassessment,
        },success:true,err:null});
    })
      
};

exports.getassessmentdatabyid = (req,res,next)=> {

    let allassessment;

    assessment.findAll({
        where:{
            id:req.query.id,
        },
        include: [{model:company, require: true}]
    }).then(assessment=>{
        allassessment = assessment.map((element)=>{
            return{
                id: element.id,
                compid:element.compid,
                assessmentname: element.assessmentname,
                status: (element.sts==1?'Active':'In-Active'),
                sts: element.sts,
            }
        });
        return res.status(200).send({data:{
            allassessment: allassessment,
        },success:true,err:null});
    })
      
};

exports.postnewassessmentadd = (req,res,next) => {
    
    assessment.findOne({
        where:{
            assessmentname:req.body.assessmentname,
            compid:req.body.assessmentcompid,
        }
    }).then(item=>{
        if(!item){
            assessment.create({
                id:uuidv4.v4(),
                compid:req.body.assessmentcompid,
                assessmentname:req.body.assessmentname,
                sts:1,
                createdby: req.body.userID,
            }).then(()=>{
                return res.status(200).send({data:{msg:"Assessment created successfully."},success:true,err:null});
            });

        }else{
            return res.status(200).send({data:{msg:"Assessment name already in existence. Cannot create duplicate value."},success:false,err:null});
        }
    })
    
};

exports.postnewassessmentedit = (req,res,next) => {
    
    assessment.findOne({
        where:{
            assessmentname:req.body.editassessmentname,
            compid:req.body.editassessmentcompany,
            id:{[Op.ne]: req.body.assessmentid},
        }
    }).then(item=>{
        if(!item){
            assessment.update({
                compid:req.body.editassessmentcompany,
                assessmentname:req.body.editassessmentname,
                sts:(req.body.chkeditassessmentstatus?1:0),
            },{ where:{ id:req.body.assessmentid } }).then(()=>{
                return res.status(200).send({data:{msg:"Assessment name updated successfully."},success:true,err:null});
            });

        }else{
            return res.status(200).send({data:{msg:"Assessment name already in existence under same company. Cannot create duplicate value."},success:false,err:null});
        }
    })
    
};

exports.postassessmentdel = (req,res,next) => {

    assessment.destroy({
        where:{
            id:req.body.id
        }
    }).then(()=>{
        return res.status(200).send({data:{msg:"Assessment deleted successfully."},success:true,err:null});
    }).catch(function (err) {
        return res.status(200).send({data:{msg:"One or more items are under this assessment. Cannot delete."},success:false,err:null});
    });
}; 
