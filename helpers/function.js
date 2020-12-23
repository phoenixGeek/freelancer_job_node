
const axios = require("axios");
const slack = require("slack-notify")(process.env.MY_SLACK_WEBHOOK_URL);
var filter = require('./filter');
exports.send_to_slack = (channel, text, attachments, blocks) => {
    slack.send({
        channel: channel,
        icon_url: "https://freelancer-job.herokuapp.com/images/freelancer.png",
        text: text,
        username: "Freelancer Jobs",
        attachments:attachments,
        blocks:blocks
    })
}
exports.real_time_notification = (data) => {
    // preparing data for slack notification
    try {
        if (data.body.type && data.body.type == "project") {
        data = data.body.data;
        const job_title = data.title;
        const project_url = process.env.FREELANCER_BASE_URL + data.linkUrl;
        const job_description = data.appended_descr;
        const project_type = data.type;
        const min_budget = data.minbudget;
        const max_budget = data.maxbudget;
        const currency = data.currency;
        const exchange_rate = data.exchangerate;
        var currency_code = data.currencyCode;
        const project_skills = data.jobString;
        const user_id = data.userId;
        const user_profile_image = data.imgUrl;
        console.log('image:',user_profile_image);
        var project_type_emoji = "";
        if (project_type == "fixed") {
            project_type_emoji = ":hourglass:";
        } else {
            project_type_emoji = ":timer_clock:";
            currency_code = currency_code + "/hr";
        }
        // project filter
        var match_filter = !data.deleted;
        if(match_filter){
            match_filter = filter.budget(project_type, max_budget, exchange_rate);
        }
        if(match_filter){
            match_filter = filter.skill(project_skills);
        }
        //
        if (match_filter) {
        
            const URL = process.env.FREELANCER_BASE_URL+"/api/users/0.1/users?users[]=" + user_id + "&employer_reputation=true&reputation=true&country_details=true&status=true";
            axios.get(URL).then((res) => {
            if (res.data.status == "success") {
                const res_data = res.data.result.users[user_id];
                // console.log("employer histotry: ", res_data.employer_reputation);
                // console.log("freelancer histotry: ", res_data.reputation);

                const user_name = res_data.public_name;
                const user_url = process.env.FREELANCER_BASE_URL+"/u/" + res_data.username;
                const user_account_balances = res_data.account_balances;
                const user_hourly_rate = res_data.hourly_rate;
                const user_role = res_data.role;
                const user_country = res_data.location.country.name;
                const user_country_code = res_data.location.country.code;

                const user_member_since = new Date(res_data.registration_date*1000);

                var user_payment_verified = res_data.status.payment_verified?":payment_verified:":":payment_unverified:";
                var user_email_verified = res_data.status.email_verified?":email_verified:":":email_unverified:";
                var user_deposit_made = res_data.status.deposit_made?":deposit_verified:":":deposit_unverified:";
                var user_profile_complete = res_data.status.profile_complete?":profile_verified:":":profile_unverified:";
                var user_phone_verified = res_data.status.phone_verified?":phone_verified:":":phone_unverified:";
                var user_identity_verified = res_data.status.identity_verified?":id_verified:":":id_unverified:";
                var user_freelancer_verified_user = res_data.status.freelancer_verified_user;
                const user_total_money_score = res_data.employer_reputation.earnings_score.toFixed(1);
                const user_mark = res_data.employer_reputation.entire_history.overall.toFixed(1);
                const user_total_project = res_data.employer_reputation.entire_history.all || 0;
                const user_reviews = res_data.employer_reputation.entire_history.reviews || 0;
                const user_complete = res_data.employer_reputation.entire_history.complete || 0;
                const user_incomplete = res_data.employer_reputation.entire_history.incomplete || 0;
                const user_completion_rate = res_data.employer_reputation.entire_history.completion_rate || 0;
                
                if (filter.country(user_country)) {
                    var channel = '#freelancer-jobs';
                    var text = '\n :male-technologist:(' +project_skills +')' + ':moneybag:' + currency + min_budget + "~" +max_budget + currency_code;
                    var attachments = [];
                    var  blocks= [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text:
                                "-------------------------------------------------------------------------------------- \n \n" +
                                project_type_emoji +
                                "  *Job Title:* <" +
                                project_url +
                                "|*" +
                                job_title +
                                "*>",
                            },
                        },
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text:
                                `:male-technologist: *Skills:* ( ${project_skills})`
                            },
                        },
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text:
                                `:dollar_blue: *Price:*  ${currency+min_budget}~${max_budget+currency_code}`
                            },
                        },
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text:
                                `:man: *Employer:* ${" <" + user_url +"|"+user_name  + ">  ( "+ user_country + " ) "}:flag-${user_country_code}: \n ${"       Member Since: " +
                                (user_member_since.getMonth() + 1) +"/" + 
                                user_member_since.getDate() + "/" +
                                user_member_since.getFullYear() + "      " +
                                user_identity_verified + "  " +
                                user_payment_verified + "  " +
                                user_deposit_made + "  " +
                                user_email_verified + "  " +
                                user_profile_complete + "  " +
                                user_phone_verified + "\n        " +
                                "Employer History: :star: " + user_mark + " ( " +user_reviews +" reviews ) :dollar_blue:" +
                                user_total_money_score
                                }
                                Total projects: ${user_total_project}, Complete: ${user_complete}, Incomplete: ${user_incomplete}
                                `
                            },
                            accessory: {
                                type: "image",
                                image_url: user_profile_image,
                                alt_text: "profile logo",
                            },
                        },
                        {
                            type: "section",
                            block_id: "section567",
                            text: {
                                type: "mrkdwn",
                                text:
                                ":blue_book: *Description* \n\n" +
                                job_description,
                            },
                            
                        },
                    ];
                    this.send_to_slack(channel, text, attachments, blocks);
                }
            }
            });
        }
        }
    } catch (error) {
        console.log(error);
    }
}
exports.project_details = (project_id) => {
    const URL = process.env.FREELANCER_BASE_URL+"/api/projects/0.1/projects/"+project_id+"?job_details=true&user_balance_details=true";
    axios.get(URL).then((project) => {
        // console.log(project.data.result);
        var pd = project.data.result;
        const USER_URL = process.env.FREELANCER_BASE_URL+"/api/users/0.1/users?users[]=" + pd.owner_id;
        axios.get(USER_URL,{
            params: {
                employer_reputation: true,
                employer_reputation_extra: true,
                reputation: true,
                reputation_extra:true,
                balance_details: true,
                financial_details: true,
                country_details: true,
                status: true,
                avatar: true,
                jobs: true, 
                profile_description: true,
            }
        }).then((res) => {
            if (res.data.status == "success") {
                var obj = res.data.result.users;
                var user = Object.keys(obj).map(function (key) { return obj[key]; })[0];
                console.log('user:', user);
                //job info
                var jobs = pd.jobs.map(function(item){return item.name});
                var project_skills = jobs.join();
                const min_budget = pd.budget.minimum;
                const max_budget = pd.budget.maximum;
                const currency = pd.currency.sign;
                const exchange_rate = pd.currency.exchange_rate;
                var currency_code = pd.currency.code;
                const project_type = pd.type;
                var project_type_emoji = "";
                if (project_type == "fixed") {
                    project_type_emoji = ":hourglass:";
                } else {
                    project_type_emoji = ":timer_clock:";
                    currency_code = currency_code + "/hr";
                }
                const project_url = process.env.FREELANCER_BASE_URL + pd.seo_url;
                const job_title = pd.title;
                const job_description = pd.preview_description;
                
                //user info
                const user_url = process.env.FREELANCER_BASE_URL+"/u/" + user.username;
                const user_profile_image = process.env.FREELANCER_BASE_URL+user.avatar;
                const user_name = user.public_name;
                const user_country = user.location.country.name;
                const user_country_code = user.location.country.code;
                const user_member_since = new Date(user.registration_date*1000);
                var user_payment_verified = user.status.payment_verified?":payment_verified:":":payment_unverified:";
                var user_email_verified = user.status.email_verified?":email_verified:":":email_unverified:";
                var user_deposit_made = user.status.deposit_made?":deposit_verified:":":deposit_unverified:";
                var user_profile_complete = user.status.profile_complete?":profile_verified:":":profile_unverified:";
                var user_phone_verified = user.status.phone_verified?":phone_verified:":":phone_unverified:";
                var user_identity_verified = user.status.identity_verified?":id_verified:":":id_unverified:";
                const user_total_money_score = user.employer_reputation.earnings_score.toFixed(1);
                const user_mark = user.employer_reputation.entire_history.overall.toFixed(1);
                const user_total_project = user.employer_reputation.entire_history.all || 0;
                const user_reviews = user.employer_reputation.entire_history.reviews || 0;
                const user_complete = user.employer_reputation.entire_history.complete || 0;
                const user_incomplete = user.employer_reputation.entire_history.incomplete || 0;

                var channel = '#project_by_id';
                var text = '\n :male-technologist:(' +project_skills +')' + ':moneybag:' + currency + min_budget + "~" +max_budget + currency_code;
                var attachments = [];
                // var blocks = [];
                var  blocks= [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text:
                            "-------------------------------------------------------------------------------------- \n \n" +
                            project_type_emoji +
                            "  *Job Title:* <" +
                            project_url +
                            "|*" +
                            job_title +
                            "*>",
                        },
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text:
                            `:male-technologist: *Skills:* ( ${project_skills})`
                        },
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text:
                            `:dollar_blue: *Price:*  ${currency+min_budget}~${max_budget+currency_code}`
                        },
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text:
                            `:man: *Employer:* ${" <" + user_url +"|"+user_name  + ">  ( "+ user_country + " ) "}:flag-${user_country_code}: \n ${"       Member Since: " +
                            (user_member_since.getMonth() + 1) +"/" + 
                            user_member_since.getDate() + "/" +
                            user_member_since.getFullYear() + "      " +
                            user_identity_verified + "  " +
                            user_payment_verified + "  " +
                            user_deposit_made + "  " +
                            user_email_verified + "  " +
                            user_profile_complete + "  " +
                            user_phone_verified + "\n        " +
                            "Employer History: :star: " + user_mark + " ( " +user_reviews +" reviews ) :dollar_blue:" +
                            user_total_money_score
                            }
                            Total projects: ${user_total_project}, Complete: ${user_complete}, Incomplete: ${user_incomplete}
                            `
                        },
                        accessory: {
                            type: "image",
                            image_url: user_profile_image,
                            alt_text: "profile logo",
                        },
                    },
                    {
                        type: "section",
                        block_id: "section567",
                        text: {
                            type: "mrkdwn",
                            text:
                            ":blue_book: *Description* \n\n" +
                            job_description,
                        },
                        
                    },
                ];
                this.send_to_slack(channel, text, attachments, blocks);
            }
        });
    });
}
exports.user_details = (user_id) => {
    const URL = process.env.FREELANCER_BASE_URL+"/api/users/0.1/users?users[]=" + user_id + "&employer_reputation=true&employer_reputation_extra=true&reputation=true&reputation_extra=true&country_details=true&status=true";
    axios.get(URL).then((res) => {
        if (res.data.status == "success") {
            const res_data = res.data.result.users[user_id];
            const user_name = res_data.public_name;
            const user_url = process.env.FREELANCER_BASE_URL+"/u/" + res_data.username;
            const user_account_balances = res_data.account_balances;
            const user_hourly_rate = res_data.hourly_rate;
            const user_role = res_data.role;
            const user_country = res_data.location.country.name;
            const user_country_flag = "https:" + res_data.location.country.flag_url_cdn;
            const user_country_code = res_data.location.country.code;

            const user_member_since = new Date(res_data.registration_date*1000);

            var user_payment_verified = res_data.status.payment_verified?":payment_verified:":":payment_unverified:";
            var user_email_verified = res_data.status.email_verified?":email_verified:":":email_unverified:";
            var user_deposit_made = res_data.status.deposit_made?":deposit_verified:":":deposit_unverified:";
            var user_profile_complete = res_data.status.profile_complete?":profile_verified:":":profile_unverified:";
            var user_phone_verified = res_data.status.phone_verified?":phone_verified:":":phone_unverified:";
            var user_identity_verified = res_data.status.identity_verified?":id_verified:":":id_unverified:";
            var user_freelancer_verified_user = res_data.status.freelancer_verified_user;
            const user_total_money_score = res_data.employer_reputation.earnings_score.toFixed(1);
            const user_mark = res_data.employer_reputation.entire_history.overall.toFixed(1);
            const user_total_project = res_data.employer_reputation.entire_history.all || 0;
            const user_reviews = res_data.employer_reputation.entire_history.reviews || 0;
            const user_complete = res_data.employer_reputation.entire_history.complete || 0;
            const user_incomplete = res_data.employer_reputation.entire_history.incomplete || 0;
            const user_completion_rate = res_data.employer_reputation.entire_history.completion_rate || 0;
            

            var attachments = [
                {
                color: "#36a64f",
                author_name:
                    user_name +
                    "   (" +
                    user_country +
                    ") :flag-" +
                    user_country_code +
                    ":" +
                    " ",
                author_link: user_url,
                author_icon: user_profile_image,
                text:
                    "Member Since: " +
                    (user_member_since.getMonth() + 1) +
                    "/" +
                    user_member_since.getDate() +
                    "/" +
                    user_member_since.getFullYear() +
                    "  " +
                    user_identity_verified +
                    "   " +
                    user_payment_verified +
                    "   " +
                    user_deposit_made +
                    "   " +
                    user_email_verified +
                    "   " +
                    user_profile_complete +
                    "   " +
                    user_phone_verified +
                    " \n" +
                    "*Total projects:* " +
                    user_total_project +
                    "   *Complete:* " +
                    user_complete +
                    "   *Incomplete:* " +
                    user_incomplete,
                // fields: [
                //   { title: 'Job Description', value: 'pre-', short: false }
                // ],
                },
            ];
            if(!restricted_country_list.includes(user_country)){
                this.send_to_slack('#freelancer-jobs', attachments);
            }
        }
    });
}