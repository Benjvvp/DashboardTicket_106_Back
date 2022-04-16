import DashboardOptions from "../database/models/DashboardOptions";
import User from "../database/models/User";

export default function checkDashboardOptionsDB() {
  //Check if the DashboardOptions collection is empty
  DashboardOptions.findOne({}, (err, dashboardOptions) => {
    if (err) {
      console.log(err);
    } else if (dashboardOptions) {
      return;
    } else {
      console.log("DashboardOptions collection is empty");
      //Create a new DashboardOptions document
      const newDashboardOptions = new DashboardOptions({
        AuthCode: Math.random().toString(36).substring(7),
      });
      //Save the new DashboardOptions document
      newDashboardOptions.save((err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("New DashboardOptions document default created");
        }
      });
    }
  });
}
