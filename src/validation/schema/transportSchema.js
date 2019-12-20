import * as yup from 'yup';

/**
 * schema validation for vehicle
 */
export const transportSchema = yup.object().shape({
  approval_status: yup
    .string()
    .required()
    .oneOf(['Pending']),
  user: yup
    .string()
    .trim()
    .required('User is mandatory'),
  vehicle_no: yup
    .string()
    .trim()
    .required('Vehilce No is mandatory'),
  drivers_name: yup
    .string()
    .trim()
    .required('Driver Name is mandatory'),
  contact_no: yup
    .string()
    .trim()
    .required('Contact No is mandatory'),
  driver_cid: yup
    .string()
    .trim()
    .required('Driver CID is mandatory'),
  common_pool: yup
    .number()
    .integer()
    .positive(),
  items: yup.array().required('Branch is mandatory'),
});

export const driverInfoSchema = yup.object().shape({
  approval_status: yup
    .string()
    .required()
    .oneOf(['Pending']),
  update_type: yup
    .string()
    .required()
    .oneOf(['Driver Detail Update']),
  user: yup
    .string()
    .trim()
    .required('User is mandatory'),
  vehicle: yup
    .string()
    .trim()
    .required('User is mandatory'),
  driver_name: yup
    .string()
    .trim()
    .required('Driver Name is mandatory'),
  driver_mobile_no: yup
    .string()
    .trim()
    .required('Driver Contact No is mandatory'),
  driver_cid: yup
    .string()
    .trim()
    .required('Driver CID is mandatory'),
  remarks: yup
    .string()
    .trim()
    .nullable(),
});
