function filter(){}

filter.prototype.budget = function(project_type,max_budget, exchange_rate ){
    // return true;
    var res = false;
    var usd_budget = (max_budget * exchange_rate).toFixed(1);
    if(project_type == 'fixed' && usd_budget >= fixed_min_budget){
       res = true;
    }
    if(project_type == 'hourly' && usd_budget >= hourly_min_budget) {
        res = true;
    }
    return res;
}
filter.prototype.skill = function(project_skills){
    // return true;
    var res = false;
    skill_list.forEach((skill) => {
        if(project_skills.includes(skill)) {
            res = true;
        }
    });
    return res;
}
filter.prototype.country = function(user_country){
    // return true;
    return !restricted_country_list.includes(user_country);
}

module.exports = new filter();