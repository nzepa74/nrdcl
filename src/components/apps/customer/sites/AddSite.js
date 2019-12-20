import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import DatePicker from 'react-native-datepicker';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {View, Image} from 'react-native';
import moment from 'moment';

import {
  Container,
  Input,
  Content,
  Form,
  Picker,
  Item,
  Button,
  Text,
  Textarea,
  Card,
  CardItem,
  Icon,
  DeckSwiper,
} from 'native-base';
import {
  setLoading,
  callAxios,
  handleError,
  getImages,
} from '../../../../redux/actions/commonActions';
import {startSiteRegistration} from '../../../../redux/actions/siteActions';
import globalStyles from '../../../../styles/globalStyle';
import {getGPSLocation} from '../../../helper/Geolocation';
import ModalSiteItem from './ModalSiteItem';
import SiteItemList from './SiteItemList';
import SpinnerScreen from '../../../base/SpinnerScreen';

export const AddSite = ({
  userState,
  commonState,
  navigation,
  startSiteRegistration,
  handleError,
  getImages,
  setLoading,
}) => {
  //state info for forms
  const [purpose, setPurpose] = useState(undefined);
  const [approval_no, setapproval_no] = useState(undefined);
  const [approval_document, setapproval_document] = useState([]);
  const [construction_type, setconstruction_type] = useState(undefined);
  const [construction_start_date, setconstruction_start_date] = useState(null);
  const [construction_end_date, setconstruction_end_date] = useState(null);
  const [number_of_floors, setnumber_of_floors] = useState(null);
  const [dzongkhag, setdzongkhag] = useState(undefined);
  const [plot_no, setplot_no] = useState(null);
  const [location, setlocation] = useState(null);
  const [remarks, setremarks] = useState(null);
  const [items, setItems] = useState([]);
  const [images, setImages] = useState([]);

  //GPS
  const [showmap, setShowmap] = useState(false);
  const [coordinate, setCoordinate] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  //Modal
  const [showModal, setShowModal] = useState(false);

  const setLatLong = cood => {
    setCoordinate(cood);
    setRegion({
      latitude: cood.latitude,
      longitude: cood.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const getGPS = async () => {
    setShowmap(true);
    const gps = await getGPSLocation();
    if (gps) {
      setLatLong({latitude: gps.latitude, longitude: gps.longitude});
    }
  };

  //all values
  const [all_purpose, setall_purpose] = useState([]);
  const [all_construction_type, setall_construction_type] = useState([]);
  const [all_dzongkhag, setall_dzongkhag] = useState([]);
  const [all_sub_item, setall_sub_item] = useState([]);

  //For proper navigation/auth settings
  useEffect(() => {
    if (!userState.logged_in) {
      navigation.navigate('Auth');
    } else if (!userState.profile_verified) {
      navigation.navigate('UserDetail');
    } else {
      //get purpose, construction_type, dzongkhag
      getFormData();
    }
  }, []);

  useEffect(() => {
    setImages([]);
    setTimeout(() => {
      setImages(approval_document);
    }, 600);
  }, [approval_document]);

  const getFormData = async () => {
    try {
      setLoading(true);
      const all_pur = await callAxios('resource/Site Purpose');
      setall_purpose(all_pur.data.data);

      const all_ct = await callAxios('resource/Construction Type');
      setall_construction_type(all_ct.data.data);

      const dz_all = await callAxios('resource/Dzongkhags', 'get');
      setall_dzongkhag(dz_all.data.data);

      const sg_all = await callAxios('resource/Item Sub Group', 'GET', {
        fields: JSON.stringify(['name', 'uom']),
        filters: JSON.stringify([['is_crm_item', '=', '1']]),
      });
      setall_sub_item(sg_all.data.data);
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
  };

  const getGewogs = async dzo => {
    let params = {
      fields: JSON.stringify(['name']),
      filters: JSON.stringify([['dzongkhag', '=', dzo]]),
    };

    try {
      const gw_all = await callAxios('resource/Gewogs', 'get', params);
    } catch (error) {
      handleError(error);
    }
  };

  //SET moment date
  const setStartDate = date => {
    setconstruction_start_date(moment(date, 'DD-MM-YYYY'));
  };

  const setEndDate = date => {
    setconstruction_end_date(moment(date, 'DD-MM-YYYY'));
  };

  //image picker
  const getSiteDocuments = async () => {
    const images = await getImages();
    setapproval_document(images);
  };

  const addItem = item => {
    setItems([...items, item]);
  };

  const removeItem = index => {
    setItems(items.filter((_, ind) => ind !== index));
  };

  const submitSiteInfo = async () => {
    const site_info = {
      approval_status: 'Pending',
      user: userState.login_id,
      purpose,
      construction_type,
      construction_start_date,
      construction_end_date,
      number_of_floors,
      approval_no,
      dzongkhag,
      plot_no,
      location,
      remarks,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      items,
    };

    startSiteRegistration(site_info, images);
  };

  return commonState.isLoading ? (
    <SpinnerScreen />
  ) : (
    <Container>
      <Content style={globalStyles.content}>
        <Form>
          <Item regular style={globalStyles.mb10}>
            <Picker
              mode="dropdown"
              selectedValue={purpose}
              onValueChange={val => setPurpose(val)}>
              <Picker.Item
                label={'Select Purpose'}
                value={undefined}
                key={-1}
              />
              {all_purpose &&
                all_purpose.map((pur, idx) => {
                  return (
                    <Picker.Item label={pur.name} value={pur.name} key={idx} />
                  );
                })}
            </Picker>
          </Item>
          <Item regular style={globalStyles.mb10}>
            <Picker
              mode="dropdown"
              selectedValue={construction_type}
              onValueChange={val => setconstruction_type(val)}>
              <Picker.Item
                label={'Select Construction Type'}
                value={undefined}
                key={-1}
              />
              {all_construction_type &&
                all_construction_type.map((val, idx) => {
                  return (
                    <Picker.Item label={val.name} value={val.name} key={idx} />
                  );
                })}
            </Picker>
          </Item>
          <Item regular style={globalStyles.mb10}>
            <Input
              value={approval_no}
              onChangeText={val => setapproval_no(val)}
              placeholder="Construction Approval No."
            />
          </Item>
          <Item regular style={globalStyles.mb10}>
            <Input
              value={number_of_floors}
              onChangeText={val => setnumber_of_floors(val)}
              placeholder="Number of Floors"
            />
          </Item>
          <Item regular style={globalStyles.mb10}>
            <DatePicker
              style={{width: '100%'}}
              date={construction_start_date}
              mode="date"
              customStyles={{dateInput: {borderWidth: 0}}}
              placeholder="Construction Start Date"
              format="DD-MM-YYYY"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              onDateChange={date => setStartDate(date)}
            />
          </Item>
          <Item regular style={globalStyles.mb10}>
            <DatePicker
              style={{width: '100%'}}
              date={construction_end_date}
              mode="date"
              customStyles={{dateInput: {borderWidth: 0}}}
              placeholder="Construction End Date"
              format="DD-MM-YYYY"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              onDateChange={date => setEndDate(date)}
            />
          </Item>
          <Item regular style={globalStyles.mb10}>
            <Picker
              mode="dropdown"
              selectedValue={dzongkhag}
              onValueChange={val => setdzongkhag(val)}>
              <Picker.Item
                label={'Select Dzongkhag'}
                value={undefined}
                key={-1}
              />
              {all_dzongkhag &&
                all_dzongkhag.map((val, idx) => {
                  return (
                    <Picker.Item label={val.name} value={val.name} key={idx} />
                  );
                })}
            </Picker>
          </Item>

          <Item regular style={globalStyles.mb10}>
            <Input
              value={plot_no}
              onChangeText={val => setplot_no(val)}
              placeholder="Plot/Thram No."
            />
          </Item>

          <Textarea
            rowSpan={3}
            width="100%"
            bordered
            placeholder="Location Details"
            value={location}
            onChangeText={val => setlocation(val)}
            style={globalStyles.mb10}
          />

          <Textarea
            rowSpan={3}
            width="100%"
            bordered
            placeholder="Remarks"
            value={remarks}
            onChangeText={val => setremarks(val)}
            style={globalStyles.mb10}
          />

          <Button
            info
            onPress={() => setShowModal(true)}
            style={globalStyles.mb10}>
            <Text>
              {items.length == 0 ? 'Add Materials' : 'Add More Materials'}
            </Text>
          </Button>
          <ModalSiteItem
            showModal={showModal}
            setShowModal={setShowModal}
            addItem={addItem}
            all_sub_item={all_sub_item}
          />

          <SiteItemList data={items} removeItem={removeItem} />

          <Button info style={globalStyles.mb10} onPress={getSiteDocuments}>
            <Text>Attach Supporting Documents</Text>
          </Button>
          {images.length === 0 ? null : (
            <View style={{height: 300, width: '100%', marginBottom: 15}}>
              <Text style={{alignSelf: 'center', color: 'red'}}>
                Swipe to review all images
              </Text>
              <DeckSwiper
                dataSource={approval_document}
                renderItem={image => (
                  <Card style={{elevation: 3}}>
                    <CardItem cardBody>
                      <Image
                        source={{
                          uri: image.path,
                        }}
                        style={{height: 250, width: '100%'}}
                      />
                    </CardItem>
                    <CardItem>
                      <Icon name="heart" style={{color: '#ED4A6A'}} />
                      <Text>
                        {image.path.substring(image.path.lastIndexOf('/') + 1)}
                      </Text>
                    </CardItem>
                  </Card>
                )}
              />
            </View>
          )}
          <View style={{marginBottom: 15}}></View>

          <Button info style={globalStyles.mb10} onPress={getGPS}>
            <Text>Set Site GPS Location</Text>
          </Button>
          {showmap && (
            <View style={[globalStyles.mapcontainer, globalStyles.mb10]}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={globalStyles.map}
                initialRegion={region}
                showUserLocation={true}
                onLongPress={e => setLatLong(e.nativeEvent.coordinate)}>
                <Marker
                  draggable
                  coordinate={coordinate}
                  onDragEnd={e => setLatLong(e.nativeEvent.coordinate)}
                />
              </MapView>
            </View>
          )}
          <View style={{marginBottom: 15}}></View>
          <Button success style={globalStyles.mb50} onPress={submitSiteInfo}>
            <Text>Submit for Approval</Text>
          </Button>
        </Form>
      </Content>
    </Container>
  );
};

const mapStateToProps = state => ({
  userState: state.userState,
  commonState: state.commonState,
});

const mapDispatchToProps = {
  startSiteRegistration,
  handleError,
  getImages,
  setLoading,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddSite);
