import {SET_ERROR, SET_LOADING, SET_TITLE, SET_RANDOM} from './actionTypes';
import {Toast} from 'native-base';
import {PermissionsAndroid, Platform} from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';
//import ImagePicker from 'react-native-image-crop-picker';
import ImagePicker from 'react-native-customized-image-picker';
import _ from 'lodash';

export const setLoading = loading => {
  return {
    type: SET_LOADING,
    payload: loading,
  };
};

export const setError = error => {
  return {
    type: SET_ERROR,
    payload: error,
  };
};

export const setTitle = title => {
  return {
    type: SET_TITLE,
    payload: title,
  };
};

export const setRandom = () => {
  return {
    type: SET_RANDOM,
    payload: _.random(3000, true),
  };
};

/* Handle Error  */
export const throwError = error => {
  return dispatch => {
    dispatch(setError(error));
    dispatch(setLoading(false));
    setTimeout(() => {
      dispatch(setError(null));
    }, 3000);
  };
};

/*Show a Toast */
export const showToast = (error, type = 'danger') => {
  return dispatch => {
    dispatch(setLoading(false));
    Toast.show({
      text: error,
      position: 'bottom',
      type: type,
      duration: 4000,
    });
  };
};

/* Common function to call axios */
export const callAxios = (
  url = '',
  method = 'get',
  params = null,
  data = null,
  responseType = 'json',
) => {
  if (method.toLowerCase() === 'get') {
    data = null;
  }
  return axios({
    url: Config.API_URL + url,
    method: method,
    headers: {'Content-Type': 'application/json'},
    params: params,
    data: data,
    responseType: responseType,
  });
};

/* Common axios call to upload file */
export const uploadAxios = data => {
  return axios({
    url: 'method/uploadfile',
    method: 'post',
    baseURL: Config.API_URL,
    headers: {'Content-Type': 'multipart/form-data'},
    data: data,
  });
};

/* common function to handle select Image 
export const selectImage = (width = 400, height = 200, cropping = true) => {
  try {
    return ImagePicker.openCamera({
      width: width,
      height: height,
      cropping: cropping,
      includeBase64: true,
    });
  } catch (error) {
    handleError(error);
  }
}; */

//image picker
export const getImages = (
  title = 'Documents',
  multiple = true,
  cropping = false,
  height = 300,
  width = 500,
) => {
  return async dispatch => {
    try {
      if (Platform.OS === 'android') {
        const perm = await PermissionsAndroid.checkPermission(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );

        if (perm === false) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: `${Config.APP_NAME} Camera Permission`,
              message: `${Config.APP_NAME} needs access to your camera`,
            },
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            dispatch(
              handleError({
                message: 'Cannot proceed without camera permission',
              }),
            );
          }
        }
      }

      const image = await ImagePicker.openPicker({
        multiple: multiple,
        includeBase64: true,
        isCamera: true,
        forceJpg: true,
        compressQuality: 50,
        cropping: cropping,
        width: width,
        height: height,
        minCompressSize: 512,
        title: title,
      });
      return image;
    } catch (error) {
      dispatch(handleError(error));
    }
  };
};

/* common function to attach a file to a doctype */
export const attachFile = async (
  doctype,
  docname,
  fileData,
  filename = null,
) => {
  if (filename === null) {
    filename = fileData.path.substring(fileData.path.lastIndexOf('/') + 1);
  }

  let file_form = new FormData();
  file_form.append('cmd', 'uploadfile');
  file_form.append('file_url', '');
  file_form.append('doctype', doctype);
  file_form.append('file_size', fileData.size);
  file_form.append('docname', docname);
  file_form.append('filedata', fileData.data);
  file_form.append('from_form', '1');
  file_form.append('is_private', '1');
  file_form.append('filename', filename);

  try {
    const response = await uploadAxios(file_form);
    return response.data.message.file_url;
  } catch (error) {
    handleError(error);
  }
};

export const handleError = error => {
  if (error.response) {
    console.log(error.response);
    //console.log(error.response.status);
    if (error.response.data.NRDCL_ERROR) {
      return showToast(error.response.data.NRDCL_ERROR);
    }
    return showToast(error.message);
  } else {
    console.log(error);
    return showToast(error.message);
  }
};
