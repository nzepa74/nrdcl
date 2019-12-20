import {
  showToast,
  setLoading,
  callAxios,
  handleError,
  attachFile,
} from './commonActions';
import {transportSchema} from '../../validation/schema/transportSchema';
import NavigationService from '../../components/base/navigation/NavigationService';

/**
 *
 * @param {details of vehicle to register} vehicle_info
 * @param {bluebook document} bluebook
 */
export const startTransportRegistration = (vehicle_info, bluebook = []) => {
  return async dispatch => {
    dispatch(setLoading(true));
    try {
      await transportSchema.validate(vehicle_info);

      let res = await callAxios(
        'resource/Transport Request/',
        'POST',
        {},
        vehicle_info,
      );

      const docname = res.data.data.name;
      const doctype = res.data.data.doctype;

      bluebook.map(async image => {
        await attachFile(doctype, docname, image);
      });

      NavigationService.navigate('ListTransport');
      dispatch(setLoading(false));
      dispatch(showToast('Transport Registration request sent', 'success'));
    } catch (error) {
      dispatch(handleError(error));
    }
  };
};

/**
 *
 * @param {vehicle no to be deregistered} vehicle
 */
export const startTransportDeregister = vehicle => {
  return async dispatch => {
    dispatch(setLoading(true));
    try {
      await callAxios(
        'method/erpnext.crm_api.deregister_vehicle',
        'post',
        vehicle,
      );

      dispatch(setLoading(false));
      NavigationService.navigate('ListTransport');
      dispatch(showToast('Successfully deregistered transport', 'success'));
    } catch (error) {
      dispatch(handleError(error));
    }
  };
};
