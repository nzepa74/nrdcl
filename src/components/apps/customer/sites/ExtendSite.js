import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import {View, Image} from 'react-native';
import {
  Container,
  Form,
  Item,
  Input,
  Button,
  Text,
  Content,
  Icon,
  Label,
  DeckSwiper,
  Card,
  CardItem,
} from 'native-base';
import SpinnerScreen from '../../../base/SpinnerScreen';
import {startSiteExtension} from '../../../../redux/actions/siteActions';
import {handleError, getImages} from '../../../../redux/actions/commonActions';
import globalStyles from '../../../../styles/globalStyle';

export const ExtendSite = ({
  userState,
  commonState,
  navigation,
  startSiteExtension,
  handleError,
  getImages,
}) => {
  const [site, setSite] = useState('');
  const [extension_approval_document, setDocuments] = useState([]);
  const [construction_start_date, setStartDate] = useState(undefined);
  const [construction_end_date, setEndDate] = useState(undefined);
  const [extension_till_date, setTillDate] = useState(undefined);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!userState.logged_in) {
      navigation.navigate('Auth');
    } else if (!userState.profile_verified) {
      navigation.navigate('UserDetail');
    } else {
      setSite(navigation.state.params.id);
      setStartDate(
        moment(navigation.state.params.start_date).format('DD-MM-YYYY'),
      );
      setEndDate(moment(navigation.state.params.end_date).format('DD-MM-YYYY'));
    }
  }, []);

  useEffect(() => {
    setDocuments([]);
    setTimeout(() => {
      setDocuments(images);
    }, 600);
  }, [images]);

  const setDate = date => {
    if (
      moment(date, 'DD-MM-YYYY').isBefore(
        moment(construction_end_date, 'DD-MM-YYYY'),
      )
    ) {
      handleError({message: 'New Extension Date should be after End Date'});
      setTillDate(undefined);
    } else {
      setTillDate(moment(date, 'DD-MM-YYYY'));
    }
  };

  //image picker
  const getSupportingDocuments = async () => {
    const images = await getImages();
    setDocuments(images);
  };

  const extendSite = () => {
    const site_status = {
      approval_status: 'Pending',
      user: userState.login_id,
      site,
      construction_start_date: moment(construction_start_date, 'DD-MM-YYYY'),
      construction_end_date: moment(construction_end_date, 'DD-MM-YYYY'),
      extension_till_date: moment(extension_till_date, 'DD-MM-YYYY'),
    };

    startSiteExtension(site_status, images);
  };

  return commonState.isLoading ? (
    <SpinnerScreen />
  ) : (
    <Container>
      <Content style={globalStyles.content}>
        <Form>
          <Item regular inlineLabel style={globalStyles.mb10}>
            <Label>Site ID</Label>
            <Input disabled value={site} placeholder="Site ID" />
          </Item>
          <Item regular inlineLabel style={globalStyles.mb10}>
            <Label>Construction Start Date</Label>
            <Input
              disabled
              value={construction_start_date}
              placeholder="Start Date"
            />
          </Item>
          <Item regular inlineLabel style={globalStyles.mb10}>
            <Label>Construction End Date</Label>
            <Input
              disabled
              value={construction_end_date}
              placeholder="End Date"
            />
          </Item>

          <Item regular inlineLabel style={globalStyles.mb10}>
            <Label>Extension Till Date</Label>
            <DatePicker
              style={{width: '50%'}}
              date={extension_till_date}
              mode="date"
              customStyles={{dateInput: {borderWidth: 0}}}
              placeholder="Extension Till Date"
              format="DD-MM-YYYY"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              onDateChange={date => setDate(date)}
            />
          </Item>

          <Button
            info
            style={globalStyles.mb10}
            onPress={getSupportingDocuments}>
            <Text>Attach Supporting Documents</Text>
          </Button>
          {extension_approval_document.length === 0 ? null : (
            <View style={{height: 300, width: '100%', marginBottom: 20}}>
              <Text style={{alignSelf: 'center', color: 'red'}}>
                Swipe to review all images
              </Text>
              <DeckSwiper
                dataSource={extension_approval_document}
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
          <View style={{marginBottom: 20}}></View>
          <Button
            success
            style={[globalStyles.mb10, globalStyles.button]}
            onPress={extendSite}>
            <Text>Request Site Extension</Text>
          </Button>
          <Button
            warning
            style={[globalStyles.mb50, globalStyles.button]}
            onPress={() => navigation.goBack()}>
            <Icon name="ios-arrow-back" />
            <Text>Go Back</Text>
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

const mapDispatchToProps = {startSiteExtension, handleError, getImages};

export default connect(mapStateToProps, mapDispatchToProps)(ExtendSite);
